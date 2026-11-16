# 01 · 总体架构

## 双进程模型

1Panel v2 由两个独立的 Go 二进制组成，共享同一份前端：

```
浏览器 ──HTTP──▶ 1panel-core (:9999)  ──unix socket──▶ 1panel-agent（master 节点，本机）
                      │
                      └──mTLS──▶ 1panel-agent（远程节点，企业版多节点）
```

| 进程 | 入口 | 职责 |
| :--- | :--- | :--- |
| `1panel-core` | `core/cmd/server/main.go:41` | 面板主进程：托管前端静态资源、登录认证/session、API Key、用户与 RBAC、日志审计、代理层；**不直接操作宿主机** |
| `1panel-agent` | `agent/cmd/server/main.go:36` | 实际干活进程：文件、容器、网站、数据库、防火墙、监控、备份、应用商店等全部节点级业务 |

社区版单机部署时，core 与 agent 运行在同一台机器，通过 **Unix domain socket `/etc/1panel/agent.sock`** 通信（`core/init/proxy/proxy.go:16`）。agent 侧由 `agent/utils/xpack/helper/multi_node.go:35` 的 `global.IsMaster = true` 判定为本机模式。

## 技术栈

| 层 | 技术 |
| :--- | :--- |
| 后端 | Go 1.27、Gin、GORM（SQLite，驱动 `github.com/glebarez/sqlite`）、gormigrate、viper、cobra、logrus、robfig/cron v3、go-i18n |
| 前端 | Vue 3.5 + TypeScript、Vite 8、Element Plus 2.14、Pinia、vue-router、vue-i18n、Tailwind CSS 4、Monaco/CodeMirror、xterm、echarts |
| API 文档 | swaggo（Swagger 注解 → `core/cmd/server/docs/docs.go`，运行时经 `/1panel/swagger/` 访问） |

## 目录总览

```
1Panel/
├── core/                      # 主进程（面板壳）
│   ├── cmd/server/            # main、cobra 子命令（reset/user-info/update…）
│   │   ├── conf/app.yaml      # 嵌入式默认配置（go:embed）
│   │   ├── docs/              # swag 生成的 swagger.json 与 x-log.json（操作日志格式表）
│   │   ├── res/html/          # 401/404 等 HTML 响应模板（go:embed）
│   │   └── web/               # 前端构建产物落地处（go:embed all:assets）
│   ├── app/                   # 业务代码：api/v2、service、repo、model、dto、auth、task
│   ├── init/                  # 启动初始化：viper、log、db、migration、session、router、proxy、cron…
│   ├── router/                # 路由注册（ro_*.go 每域一个）
│   ├── middleware/            # Gin 中间件（session、csrf、密码 RSA、域名绑定…）
│   ├── buserr/                # 业务错误（带 i18n key）
│   ├── i18n/                  # go-i18n + lang/*.yaml（12 语言）
│   └── global/                # 全局单例：CONF、DB、LOG、SESSION…
├── agent/                     # 节点进程（业务主体）
│   ├── cmd/server/            # main、conf、nginx_conf/（内嵌 nginx 模板与 rewrite 规则）
│   ├── app/                   # api/v2、service、repo、model、dto、provider、task
│   ├── init/                  # viper、dir（目录规划）、db、migration、cache、business…
│   ├── cron/                  # 定时任务（监控、备份、SSL 续期…）
│   ├── router/                # ro_*.go 路由注册（25 个业务域）
│   └── utils/                 # 40+ 工具包：docker、nginx、mysql、firewall、ssh、files…
├── frontend/                  # Vue 3 前端（见 06-frontend.md）
├── docs/                      # 多语言 README
└── Makefile                   # 构建编排（见 07-build.md）
```

## 关键全局单例

两端结构对称，均通过 `global` 包暴露进程级单例（`core/global/global.go`、`agent/global/global.go`）：

- `global.CONF` — viper 加载的 ServerConfig（`core/global/config.go:3`）
- `global.DB / TaskDB / AgentDB(core) / AlertDB` — GORM 连接（见 04-database.md）
- `global.LOG` — logrus 实例（文件 + stdout 双写）
- `global.SESSION`（core）— 内存 session（`core/init/session/session.go:9`）
- `global.I18n` — 当前请求语言的 Localizer
- `global.Cron`（agent）— robfig/cron 调度器
- `global.Dir`（agent）— 统一目录规划（`agent/init/dir/dir.go:11`）

## xpack 双轨机制（重要）

商业代码通过**构建标签 + 桩实现**与社区版隔离，是理解二次开发边界的关键：

- 社区版桩：`agent/utils/xpack/community.go:1`、`core/utils/xpack/community.go:1`，带 `//go:build !xpack && !enterprise`
- 接口定义：`*/utils/xpack/providers/`（如 `core/utils/xpack/providers/auth.go:12` 的 `AuthProvider`，含登录/MFA/passkey/RBAC 中间件）
- 业务代码只依赖 `xpack.MultiNodeProvider`、`xpack.AuthProvider` 等接口变量，编译时链接到桩（社区版）或真实现（xpack 源码，仓库中不存在）
- 社区版单机行为即来自桩：`LoadNodeInfo` 返回 master 节点并置 `IsMaster=true`（`agent/utils/xpack/helper/multi_node.go:31`）

**二开含义**：遇到 `xpack.XxxProvider` 调用点，要么接受桩的默认行为，要么实现自己的 provider（详见 08-dev-guide.md）。
