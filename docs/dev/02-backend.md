# 02 · 后端开发

## 启动链路

两端入口极简：`main.go` → cobra `RootCmd` → `server.Start()`。

**core 启动序列**（`core/server/server.go:40`，顺序敏感）：

```
re.Init()            # 正则缓存
viper.Init()         # 配置：嵌入 app.yaml + /opt/1panel/conf/app.yaml(dev) + 1pctl 环境变量
log.Init()           # logrus（install_dir/1panel/log，按天滚动）
db.Init()            # 打开 4 个 SQLite 连接（见 04）
migration.Init()     # gormigrate（见 04）
i18n.Init()          # 语言由 DB Setting.Language 决定
validator.Init()     # go-playground/validator
geo.Init()
cron.Init()          # core 侧定时任务（备份）
session.Init()      # 内存 session
hook.Init()
proxy.Init()         # 创建 → agent 的 Unix socket 反向代理
router.Routers()     # 装配全部路由与中间件
http.Server{...}     # 监听 CONF.Conn.BindAddress:Port，支持 http/https/cmux 三种模式
```

dev 模式判定：`mode == "dev"` 且存在 `/opt/1panel/conf/app.yaml` 时，配置可覆盖嵌入默认值（`core/init/viper/viper.go:33`）；生产模式从 `/usr/local/bin/1pctl` 脚本加载 `BASE_DIR`/`ORIGINAL_PORT` 等变量（`core/cmd/server/cmd/root.go:53`）。

**agent 启动序列**（`agent/server/server.go:95`）：`re → viper → dir（目录规划）→ log → db → migration → i18n → cache → app（docker 网络检查）→ cron → firewall → kvm`。随后按 `IsMaster` 分叉：

- **master**：监听 Unix socket `/etc/1panel/agent.sock`（权限 0700/0600 校验，`agent/server/server.go:129`），随后 `business.Init()` 异步同步应用商店/已装应用/运行时/SSL/任务状态
- **非 master**（远程节点）：监听 `https://0.0.0.0:port`，**强制 mTLS 双向认证**（`ClientAuth: RequireAndVerifyClientCert`，`agent/server/server.go:166`）

## 分层约定

两端 `app/` 内完全一致的四层结构，以 core 的 setting 域为例：

```
router/ro_setting.go           # 路由：URL → API handler，挂中间件
app/api/v2/setting.go          # API 层：参数绑定/校验、调 service、统一响应
app/service/setting.go         # Service 层：业务逻辑，持有接口类型
app/repo/setting.go            # Repo 层：GORM 读写 + go-cache 缓存
app/model/setting.go           # Model：GORM 表结构
app/dto/setting.go             # DTO：请求/响应结构体（validate tag）
```

各层职责与规矩：

| 层 | 职责 | 禁止 |
| :--- | :--- | :--- |
| api | `ShouldBindJSON` + `global.VALID.Struct` 校验，转调 service，用 `helper.Success*/ErrorWithDetail` 收尾 | 不写业务逻辑 |
| service | 业务编排、跨 repo 组合、buserr 错误 | 不直接碰 `global.DB`（用 repo） |
| repo | 唯一允许写 GORM 的层；`global.DBOption` 函数式查询条件；缓存（setting 带 5min TTL） | 不含业务判断 |
| model | 表结构 + gorm tag；`Base` 模型嵌入 `gorm.Model` | — |
| dto | 请求/响应载荷；binding tag（`binding:"required"` 等） | — |

**典型 API 写法**（`core/app/api/v2/setting.go:137`）：

```go
// @Tags System Setting
// @Summary Update system setting
// @Accept json
// @Param request body dto.SettingUpdate true "request"
// @Success 200
// @Security ApiKeyAuth
// @Security Timestamp
// @Router /core/settings/update [post]
// @x-panel-log {"bodyKeys":["key","value"],"paramKeys":[],"BeforeFunctions":[],"formatZH":"修改系统配置 [key] => [value]","formatEN":"update system setting [key] => [value]"}
func (b *BaseApi) UpdateSetting(c *gin.Context) {
    var req dto.SettingUpdate
    if err := helper.CheckBindAndValidate(&req, c); err != nil {   // 绑定+校验一体
        return
    }
    // ...业务前置校验...
    if err := settingService.Update(c, req.Key, req.Value); err != nil {
        helper.InternalServer(c, err)                                // 统一错误出口
        return
    }
    helper.Success(c)
}
```

三个注解全家桶都不可省：

1. **Swagger 注解**（`@Router/@Param/@Success`）→ `swag init` 生成 `cmd/server/docs/docs.go` 与 `swagger.json`
2. **`@x-panel-log`** → 生成 `cmd/server/docs/x-log.json`，运行时被操作日志中间件读取（见 05）
3. 路由必须同时在 `router/ro_*.go` 注册

## 依赖装配（无 wire 框架）

项目**不用** google/wire，采用「接口 + 构造函数 + 包级单例」的手工装配：

```go
// service 定义接口与构造器（core/app/service/setting.go:51）
type ISettingService interface { ... }
func NewISettingService() ISettingService { return &SettingService{} }

// 同包 entry.go 定义包级变量（core/app/service/entry.go:10）
var (
    settingRepo = repo.NewISettingRepo()   // repo 同理
    ...
)

// api 层同模式（core/app/api/v2/entry.go:11）
var settingService = service.NewISettingService()
```

新增 service/repo 时：实现接口 + `NewIXxx` 构造器 + 在对应 `entry.go` 加包级变量 + 在 api 的 `entry.go` 引用。

**路由注册链**（`core/init/router/router.go:106`）：

```go
PrivateGroup := Router.Group("/api/v2/core")   // core 域前缀 /api/v2/core
for _, router := range rou.RouterGroupApp {    // RouterGroupApp 在 router/entry.go（构建标签切换）
    router.InitRouter(PrivateGroup)
}
```

`router/entry.go:1` 用 `//go:build !xpack && !enterprise` 切换社区/商业路由表；社区表在 `router/common.go:3`（core 9 个域），agent 在 `agent/router/common.go:3`（26 个域）。agent 路由前缀为 `/api/v2`（`agent/init/router/router.go:26`）——**无 `/core` 段**，这正是 core 代理转发判断的依据。

agent 侧规模参考：`agent/app/api/v2/entry.go:13` 装配了 60+ 个 service 变量；`agent/app/service/entry.go` 装配 40+ 个 repo。新增域时同步维护两处。

## 路由文件模板（ro_xxx.go）

```go
func (s *SettingRouter) InitRouter(Router *gin.RouterGroup) {
    baseApi := v2.ApiGroupApp.BaseApi
    authRouter := Router.Group("settings").Use(middleware.SessionAuth())      // 需登录
    { authRouter.POST("/search", baseApi.GetSettingInfo) }
    internalRouter := Router.Group("settings")                                // 内部端点（如 ReloadSSL 仅 localhost）
    { internalRouter.POST("/ssl/reload", baseApi.ReloadSSL) }
}
```

分组惯例：`authRouter`（SessionAuth + 业务中间件）/ 公开路由 / internal 路由三段式（见 `core/router/ro_setting.go:11`）。

## agent 特有子系统

- **provider**：`agent/app/provider/` — AI agent 账号目录/发现/验证（openclaw 等 AI 能力）
- **task**：`agent/app/task/task.go` — 后台任务框架（见 05）
- **cron**：`agent/cron/` — 应用同步、备份、SSL 续期、网站检查等定时任务（robfig/cron v3，`agent/cron/cron.go:18`）
- **nginx_conf**：`agent/cmd/server/nginx_conf/` — 内嵌 nginx 配置模板（ssl.conf、44 个程序 rewrite 规则），经 go:embed 打进二进制
- **utils 大全家**（`agent/utils/`）：docker（容器/compose 操作）、nginx（配置生成）、mysql/postgresql/mongodb/redis（数据库管理）、firewall、ssh（远程连接）、files（文件操作 fileOp）、encrypt（AES 加解密，密钥在 DB）、cmd（超时命令执行）、websocket、terminal 等——**二开写节点级业务优先复用这些包，不要直接 os/exec**。
