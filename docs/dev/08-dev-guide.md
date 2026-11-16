# 08 · 二开实战指南

## 决策先行：改哪一侧？

| 需求 | 落点 |
| :--- | :--- |
| 面板级功能（用户、API Key、日志、全局设置、MCP） | core：`/api/v2/core/*` 路由，core 自己实现 |
| 节点级功能（文件、容器、网站、数据库、监控…） | agent：`/api/v2/*` 路由，**core 侧零改动**（代理自动转发） |
| 纯前端交互 | 仅 frontend |

## 端到端示例：agent 新增「device」域（完整清单）

以仓库既有的 device 域为参照（`agent/app/api/v2/device.go` 等），新增一个 agent 业务域需要动的文件：

**后端（7 步）**

1. **model**：`agent/app/model/device.go` — 表结构
2. **migration**：`agent/init/migration/migrations/sd_xxx.go` — 建表迁移（ID 加自有前缀），登记到 `agentDBMigrations()` 末尾（见 04）
3. **repo**：`agent/app/repo/device.go` — `IDeviceRepo` 接口 + `NewIDeviceRepo()` + CRUD
4. **service**：`agent/app/service/device.go` — `IDeviceService` 接口 + 实现；在 `service/entry.go` 加 repo 变量
5. **dto**：`agent/app/dto/device.go` — 请求/响应结构（binding 校验 tag）
6. **api**：`agent/app/api/v2/device.go` — handler（Swagger 注解 + `@x-panel-log` + `helper` 响应）；在 `api/v2/entry.go` 加 service 变量
7. **router**：`agent/router/ro_device.go` — 路由注册；在 `router/common.go` 的 `commonGroups()` 追加 `&DeviceRouter{}`

**配套（3 步）**

8. **错误码**：`agent/i18n/lang/zh.yaml` + `en.yaml` 加 `ErrDeviceXxx` key
9. **重新生成 swagger**：`swag init -g agent/cmd/server/main.go -o agent/cmd/server/docs`（x-log.json 随之更新，操作日志才有格式）
10. **菜单**（如需侧边栏）：core 迁移改 `HideMenu` 默认值（参考 `core/init/migration/helper/menu.go` 的菜单结构）

**前端（4 步）**

11. `frontend/src/api/interface/device.ts` — 类型
12. `frontend/src/api/modules/device.ts` — API 函数（路径 `/devices/...`，无 `/core` 前缀）
13. `frontend/src/routers/modules/device.ts` — 路由 + 菜单（sort 定顺序，meta.title 用 i18n key）
14. `frontend/src/views/device/index.vue` — 页面；`lang/modules/*.ts` 加 namespace（zh/en 必须）

**core 域新增**同理，但路由挂 `/api/v2/core` 组且需处理认证分组（`SessionAuth`），并注意该域 API 前端调用带 `/core` 前缀。

## xpack 边界：绕过商业功能限制

商业能力全部经 `xpack.*Provider` 接口注入，社区版桩默认返回失败/固定值：

- `VMCountLimit → 1`（VM 数量，`agent/utils/xpack/community.go:21`）
- `MultiNodeProvider.Proxy` —— 社区版无远程节点转发
- `AuthProvider.CoreRBACMiddlewares()` —— 社区版返回空（即仅 admin 体系）

二开若需多节点/RBAC/更高 VM 上限，需**自行实现 provider 接口**并替换桩（在 `utils/xpack/community.go` 或以相同构建标签机制提供自己的实现），但注意这属于对接闭源接口的逆向工程，**GPL v3 传染性**要求你的实现同样开源。

## 与上游同步的工程纪律（重点）

上游 `dev-v2` 活跃开发（近期高频提交），同步时最大冲突源是「上游改了你也改过的文件」。纪律：

1. **改动面最小化**：优先新增文件，少改上游文件；确需改上游文件时改动集中、注释标记（如 `// SD:` 前缀）便于合并时定位
2. **集中二开资产**：迁移、菜单默认值等必须触碰上游切片/列表的，用独立文件承载（`migrations/sd_*.go`），登记行尽量追加在末尾同一位置
3. **同步流程**（详细命令见根 AGENTS.md「分支模型」）：

```bash
git switch dev-v2 && git fetch upstream && git merge --ff-only upstream/dev-v2
git switch dev && git merge dev-v2        # 冲突在此解决
```

4. **冲突高发点清单**：`router/common.go`（双方都追加路由组）、`api/v2/entry.go` 与 `service/entry.go`（变量表）、`migrations/migrate.go`（迁移列表）、`lang/modules/*.ts` 与 `i18n/lang/*.yaml`（同一文件追加 key）、`x-log.json`/`docs.go`（生成物，直接重新生成覆盖）

## 提交规范（本 fork）

按 git-workflow skill：`<type>(<scope>): <subject>` 简体中文、一个逻辑单元一提交、显式 `git add`。二开提交建议 scope 与上游风格对齐（如 `feat(device): xxx`），便于区分来源。

## 快速参考：常用命令

```bash
# 后端
cd core && go build ./... && go test ./...
cd agent && go build ./... && go test ./...
swag init -g core/cmd/server/main.go -o core/cmd/server/docs

# 前端
cd frontend && npm run dev          # 开发
npm run type-check                  # 类型检查
npm run lint:eslint                 # lint

# 全量构建（Linux）
make build_all                      # build/1panel-core + build/1panel-agent
```

## 已知坑

- **Windows 原生不可运行后端**：unix socket、systemd、root 校验（`core/cmd/server/cmd/root.go:81`）、linux-only 初始化（`agent/server/server.go:96` 的 KVM 块等）；开发用 WSL2
- **session 是内存态**：core 重启全员掉登录，不是 bug
- **改了 API 注解没重新 swag init**：swagger 文档与 x-log.json 是旧数据，操作日志静默缺失
- **agent 接口没带 `@x-panel-log`**：功能正常但操作日志页查不到记录
- **前端新 key 只加 zh 不加 en**：其他语言用户看到裸 key
- **i18n yaml 语法错误**：启动直接 panic（`core/i18n/i18n.go:254`），报错会指出具体文件
- **直接 `go run` agent 而无 root**：socket 目录 `/etc/1panel` 权限校验失败 panic（`agent/server/server.go:129`）
