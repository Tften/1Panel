# 07 · 构建与部署

## 构建流水线（Makefile）

`make build_all` = 前端 → core → agent（`Makefile:50`）：

```bash
make build_all            # Linux 本机构建（CGO_ENABLED=0）
make build_on_local       # macOS 上交叉编译 linux/amd64
make build_frontend       # 仅前端：npm install && npm run build:pro
make build_core_on_linux  # 仅 core → build/1panel-core
make build_agent_on_linux # 仅 agent → build/1panel-agent（先跑 prepare_vm_helper）
```

产物为两个静态二进制（`-trimpath -ldflags '-s -w'`），agent 构建前 `prepare_vm_helper` 会编译 KVM helper（`agent/utils/vm/helper/prepare.sh`，Linux 特性，跨平台开发可跳过）。

## 前端产物嵌入链

```
vite build (outDir=../core/cmd/server/web, vite.config.ts:141)
    ↓ 产物落进 core/cmd/server/web/{index.html,assets/}
core/cmd/server/web/web.go  go:embed index.html / all:assets / favicon.png / static
    ↓ Gin StaticFS 提供服务（core/init/router/router.go:32）
```

- **本地开发**：`cd frontend && npm run dev`（Vite 9998 端口起 dev server，`/api/v2` 代理到 `localhost:9999`，`vite.config.ts:87`）——后端 core 需同时运行且 `/opt/1panel/conf/app.yaml` 存在（dev 模式）
- **改前端不需重编 Go**（dev 模式），但**发布构建**必须先 `make build_frontend` 再编 core，否则嵌入的是旧 assets
- `.gitignore:37` 忽略 `core/cmd/server/web/assets`——构建产物不进库

## 运行模式与配置

| 模式 | 判定 | 行为 |
| :--- | :--- | :--- |
| dev | 嵌入 yaml `mode: dev` 且存在 `/opt/1panel/conf/app.yaml` | gin.DebugMode；外置配置覆盖；日志 debug |
| stable | 生产 | gin.ReleaseMode；配置来自 1pctl 环境变量 |

core 监听三形态（`core/server/server.go:113`）：http / https（证书 `<install_dir>/1panel/secret/server.crt`）/ cmux（同端口 http+https 自动分流，明文 http 请求 307 重定向到 https）。

## 安装目录布局（运行时）

```
/opt/1panel/
├── db/          core.db agent.db task.db alert.db（migrations 表在各库内）
├── log/         1Panel-Core.log / 1Panel.log / task/<scope>/<taskID>.log / ssl/
├── conf/        app.yaml（dev 覆盖用）
├── apps/        应用安装目录（/opt/1panel/apps/<app>/<name>）
├── resource/    应用商店缓存/图标/本地应用包
├── runtime/     PHP/Node 运行时
├── tmp/         临时目录
└── secret/      server.crt/server.key（面板自身 TLS）
```

agent 目录规划代码：`agent/init/dir/dir.go:11`（`global.Dir.*` 常量）。二开涉及落盘文件时**必须**复用 `global.Dir`，不要硬编码路径。

## 1pctl 与 systemd

- `/usr/local/bin/1pctl`：运维 CLI，承载 BASE_DIR/ORIGINAL_PORT 等环境注入 + user-info/reset/update 子命令（实现在 core 的 cobra 子命令，`core/cmd/server/cmd/`）
- 进程管理：systemd `1panel-core.service` / `1panel.service`（agent）
- 官方安装脚本（quick_start.sh）不在仓库中，来自 resource.1panel.pro

## 本地开发环境搭建（Linux/WSL2）

```bash
# 1. 前端
cd frontend && npm install && npm run dev        # http://localhost:9998

# 2. 后端（root 运行；需 /opt/1panel/conf/app.yaml 且 mode=dev）
sudo mkdir -p /opt/1panel/conf /opt/1panel/db
sudo cp core/cmd/server/conf/app.yaml /opt/1panel/conf/
cd core && go run ./cmd/server                   # :9999

# 3. agent（另开终端，root）
cd agent && go run ./cmd/server                  # 监听 /etc/1panel/agent.sock
```

注意：core 首启会跑迁移建库；agent 依赖 docker（`utils/docker` 走 DOCKER_HOST 或默认 socket）；Windows 原生无法直接跑（unix socket/系统调用），建议 WSL2 或 Linux 虚机。前端 `VITE_API_URL=/api/v2` + proxy 已配好跨域。
