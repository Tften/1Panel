# 05 · 横切机制

## 错误处理：buserr + i18n

两层协作，后端永远只传 **错误 key**，翻译在出口处完成：

```
service 层:  return buserr.New("ErrRecordNotFound")
                  或 buserr.WithName("ErrFileNotFound", path)
                  或 buserr.WithErr("ErrPathNotFound", err)
api 出口:    helper.InternalServer(c, err)   → ErrorWithDetail()
                ↓ i18n.GetMsgWithMap(key, {detail: err})
             { "code": 500, "message": "服务内部错误: xxx" }
```

- 结构定义：`core/buserr/errors.go:8`（`BusinessError{Msg, Detail, Map, Err}`），agent 侧 `agent/buserr/errors.go` 完全对称
- 翻译模板：`core/i18n/lang/zh.yaml:1` 起的 key-value，支持 `{{ .detail }}`/`{{ .name }}`/`{{ .err }}` 占位
- **新增错误码流程**：① `zh.yaml` 加 key（en.yaml 等 11 种语言同步，至少 en 必须有）→ ② service 用 `buserr.New/WithName/WithErr` 抛出 → ③ 前端收到的 message 已是翻译后文案，直接 `MsgError` 展示
- yaml 加载失败会 panic（`core/i18n/i18n.go:253`），漏配 key 时前端显示原始 key 字符串——见到裸 key 即翻译缺失

## 操作日志（审计）

`@x-panel-log` 注解 → `swag` 生成 `cmd/server/docs/x-log.json` → 运行时 `OperationLog` 中间件读取（`core/middleware/operation.go:37`）：

```
非 GET 且路径不含 "search"
  → 从 x-log.json 查路径的格式模板（bodyKeys/paramKeys/formatZH/formatEN）
  → 按模板提取请求体字段（凭证类字段 redact）
  → 包一层 responseBodyWriter 执行业务
  → 成功后落库 model.OperationLog（user/node/ip/method/path/ua/耗时）
```

agent 侧对应 `OperationResolveMeta`（`agent/middleware/operation.go`），负责解析 BeforeFunctions（跨节点场景把 ID 换成名称）。

**新增写接口必配 `@x-panel-log`**，否则操作在日志页不可见。生成命令：

```bash
swag init -g core/cmd/server/main.go -o core/cmd/server/docs   # core
swag init -g agent/cmd/server/main.go -o agent/cmd/server/docs # agent（x-log.json）
```

（docs 目录的 `docs.go`/`swagger.json`/`x-log.json` 均为生成物，随源码提交。）

## 日志

logrus，初始化在 `core/init/log/log.go:19` / `agent/init/log/log.go`：

- 输出：文件 + stdout 双写（MultiWriter），文件按天滚动、保留 `max_backup` 份
- 路径：`<install_dir>/1panel/log/1Panel-Core.log`（agent：`1Panel.log`）
- 格式：`[时间] [LEVEL] 消息 (函数:行号)`（自定义 MineFormatter）
- 用法：`global.LOG.Errorf("... err: %v", err)`；**任务日志另走 task 框架**（见下）

## i18n（后端）

- 12 种语言 yaml：`core/i18n/lang/`、`agent/i18n/lang/`（zh/en/zh-Hant/ja/ko/ru/tr/ms/pt-BR/es-ES/fa/lo）
- go:embed 打进二进制（`core/i18n/i18n.go:129`），请求头 `Accept-Language` 驱动（UseI18n 中间件），默认语言取 DB `Setting.Language`
- 常用 API：`i18n.GetMsgByKey/GetMsgWithMap/GetMsgWithDetail/GetWithName`
- 命令行场景用 `global.I18nForCmd`（`core/i18n/i18n.go:156`，语言来自 1pctl）
- 任务名称也走 i18n：`task.GetTaskName` 用 `operate/scope` 两个 key 拼装（`core/app/task/task.go:86`）

## 任务系统（agent/app/task）

长耗时操作（安装应用、备份、升级、快照）统一走 Task 框架（`core/app/task/task.go:27`）：

- `Task`：唯一 ID（uuid）、名称（i18n）、状态机（Executing→Success/Failed）、**独立日志文件** `<install_dir>/1panel/log/task/<scope>/<taskID>.log`、落库 `task.db`
- `SubTask`：子步骤，支持 `Retry/Timeout/ShouldRetry/RetryBackoff/Rollback/IgnoreErr`
- 前端轮询任务接口拿进度与日志（`TaskScope*` 常量区分域：AppInstallTask/Backup/AI/…）

**写任何耗时 > 秒级的操作都用它**，不要裸 `go func`——用户在 UI 的任务中心看不到进度。

## 定时任务

- agent：robfig/cron v3（`agent/cron/cron.go:18`），job 在 `agent/cron/job/`（app 同步、备份、SSL 续期、网站过期检查、容器镜像更新检查）；监控采集独立管理
- core：`core/init/cron/cron.go`（备份类）
- 用户自定义计划任务（cronjob 域）是业务功能，与上述系统任务不同层

## 加密与安全

- `utils/encrypt`：AES 加解密（密钥存 DB setting，agent 启动时初始化）——SSL 私钥、数据库连接串入库前必加密
- 登录密码传输：前端 RSA 公钥加密（`SetPasswordPublicKey` 中间件下发公钥）→ core 解密
- CSRF：非 GET 请求校验 `X-CSRF-Token`（cookie `pcsrftoken` 配对）

## 配置体系（viper）

三层合成（`core/init/viper/viper.go:17`）：

1. 嵌入默认值：`cmd/server/conf/app.yaml`（go:embed）
2. dev 模式：`/opt/1panel/conf/app.yaml` 覆盖 + fsnotify 热更新
3. 生产：`/usr/local/bin/1pctl` shell 脚本里的变量（BASE_DIR/ORIGINAL_PORT/…，`utils/ctl_conf` 解析）

**改端口/安装目录等运行参数走 DB setting（面板设置页）或 1pctl，不要改嵌入 yaml 再重编**——嵌入值只是首装种子。
