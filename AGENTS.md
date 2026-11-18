# 1Panel 二次开发约定

本仓库是 [1Panel-dev/1Panel](https://github.com/1Panel-dev/1Panel) 的 fork，用于二次开发。

## 分支模型

| 分支 | 用途 |
| :--- | :--- |
| `dev-v2` | **仅用于同步上游仓库**（`https://github.com/1Panel-dev/1Panel.git`），**不允许直接修改**，所有提交必须来自上游 |
| `dev` | **二次开发的主分支**，基于 `dev-v2` 创建；功能分支自此切出、完成后合回 |

同步上游：

```bash
git switch dev-v2
git fetch upstream
git merge --ff-only upstream/dev-v2   # 仅允许快进，保证历史与上游一致
git switch dev
git merge dev-v2                      # 上游变更并入二开主分支
```

Git 管理规范（分支流程、Commit Message、风险分级）参考 `git-workflow` skill；**本仓库已授权 `git push`**——日常提交后可直接推送到 `origin/dev`（无需逐次确认），方便本机与开发机 `~/1Panel/` 之间保持代码同步；`dev-v2` 仍禁止推送（仅同步上游）。

## 仓库结构

- `core/`：管理端后端（Go）
- `agent/`：被管节点后端（Go）
- `frontend/`：Web 前端（Vue 3 + TypeScript + Vite）
- `docs/dev/`：二次开发资料（[目录](docs/dev/README.md)）——架构、后端、请求链路、数据库、横切机制、前端、构建、二开实战共 8 篇，动代码前先读对应篇目

## Subagent 派发约定

如需派发 subagent，**每次仅派发一个**，待其完成后再派发下一个；不要并行派发多个，容易被限流。

## 开发机（Ubuntu）

| 项 | 值 |
| :--- | :--- |
| 登录 | `ssh ausu-f15`（用户 `u26`，密钥 `~/.ssh/id_ed25519_ausu_f15_u26`） |
| SSH 客户端 | 本机 Git Bash 自带的 `ssh` 无法解密带口令的密钥，**须用 Windows 原生 `C:\Windows\System32\OpenSSH\ssh.exe`**（其 ssh-agent 服务已运行并持有该密钥） |
| 代码 | `~/1Panel/`：与本仓库 `origin` 同源（github.com/Tften/1Panel），分支 `dev` |
| 面板安装 | `~/1panel-v2.4.1-linux-amd64/`：官方 v2.4.1，二进制已部署至 `/usr/local/bin/1panel-{core,agent}`（软链到 `/usr/bin/`） |
| 运行方式 | systemd：`1panel-core.service` + `1panel-agent.service`（root 运行，开机自启）；面板端口 `41397`（http） |
| 数据目录 | `/opt/1panel/`（db/log/apps 等） |

**二次开发调试约定**：

1. 允许先 `sudo systemctl stop 1panel-core 1panel-agent` 停止官方进程，再在 `~/1Panel/` 启动开发版后端；调完恢复 `sudo systemctl start 1panel-core 1panel-agent`
2. 开发版 core 须以 root 运行（`sudo go run ./cmd/server`，agent 同理），否则 `/etc/1panel/agent.sock` 权限校验失败
3. 注意版本差异：官方运行的是 **v2.4.1 发布版**，`~/1Panel/` 是 `dev-v2` 开发分支（v2.0.0-beta 线），数据库结构可能存在发布版之后追加的迁移；如遇不兼容，备份 `/opt/1panel/db/` 后再让开发版跑迁移

**开发机工具链**：

| 工具 | 版本/路径 | 说明 |
| :--- | :--- | :--- |
| Go | 1.27.3（`~/.local/go/bin/go`） | 已配 `GOPROXY=https://goproxy.cn,direct`；PATH 已写入 `~/.bashrc` |
| Node/npm | v24.22.3 / 11.19.1（nvm 管理，旧版 v24.22.1 已卸载） | nvm 的 `default` 别名已指向 v24.22.3；**非交互 SSH 命令里需先 `export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"`**（或用 `bash -ic`），否则找不到 node |
| 构建验证 | core/agent `go build ./...` 均通过 | agent 编译前需 `bash agent/utils/vm/helper/prepare.sh` 下载 KVM helper 二进制（首次已执行）；core 编译需先有前端产物（占位文件已在 `core/cmd/server/web/` 建过，gitignore 忽略不入库） |
| swag | v1.16.4（`~/go/bin/swag`，PATH 已含） | **不要裸跑 `swag init`**（会生成不完整文档）；官方流程是 go test 驱动：`cd core/cmd/server/docs && go test -run "TestGenerateXlog\|TestGenerateSwaggerDoc"`，自动生成 core/agent 的 swagger 与 x-log（见 `core/cmd/server/docs/swagger_test.go`） |

下载镜像源备注：go.dev 直连很慢（实测 <100KB/s），装工具用阿里云镜像 `https://mirrors.aliyun.com/golang/`；npm 源如慢可换 `npmmirror`。

## React 前端（frontend-react）

新前端位于 `frontend-react/`，已接入 core 静态嵌入，替换了 `Makefile` 的 `WEB_PATH`。开发机入口：

| 项 | 值 |
| :--- | :--- |
| 安全入口 | `/d8b8d56a15`（**格式是 `/{code}`，不是 `/entrance/{code}`**） |
| 开发版地址 | `http://<开发机IP>:41397/d8b8d56a15` |
| Vite 热更新 | `http://<开发机IP>:4005`（端口 4005，`/api` 代理到 41397） |
| 构建产物 | `frontend-react` → `core/cmd/server/web/`（`emptyOutDir: false`，勿删 `web.go`） |
| 凭据文件 | 开发机 `~/1panel-dev-credentials.env`（600 权限，含 sudo/面板密码，不入库） |

已踩过的坑（勿重复排查）：

1. **安全入口路径**：core 用 `/{code}`，React 路由需同时支持 `/login`、`/entrance/:code`、`/:code`，否则 `EntranceCode` 头为空导致登录报 `Security entrance information error`。
2. **fetch 绑定**：`HttpClient` 存 `fetch` 后必须用 `globalThis.fetch(...)` 包装调用，否则浏览器报 `Illegal invocation`，登录会"无反应"。
3. **登录接口必填 `language`** 字段，缺失返回 400。
4. **验证码是后端 IP 级锁定**：连续失败后即使 `needCaptcha=false` 也强制校验，前端必须保留验证码流程。
5. **Vite `emptyOutDir: true` 会删掉 `core/cmd/server/web/web.go`**，必须保持 `false`，并保证 `favicon.png`、`static/` 存在。
6. **`.gitignore` 的 `logs` 规则会误匹配 `src/pages/logs/`**，需 `!src/pages/logs` 例外。
7. **Base UI 组件不支持 `asChild`**（那是 Radix API），用 `render` prop 或直接包 children。
8. **React 19 lint 规则**禁止在 effect 内同步 `setState`，用派生值或在事件中设置。

开发机重建流程：`git pull` → `npm run build`（frontend-react）→ `go build`（core）→ 重启 `/usr/local/bin/1panel-dev-core`。

## 前端重构开发管控

React + TypeScript + Vite + 官方 shadcn/ui 的完整前端重构在开发期与现有 Vue 面板并存；保持业务行为和 API 契约不变，功能对照和浏览器回归通过后才整体切换。旧前端的回退能力在切换后保留至稳定验收，不提前清理。

本项工作的开发门禁依次为：`grill-with-docs`（明确边界、测试接缝）→ `to-spec`（规格发布到本仓库 GitHub Issues）→ `to-tickets`（用户确认拆分与依赖后发布子工单）→ `implement-spec` 或 `implement`（按工单实现）→ `code-review`（检查、修复和复验）。`git-workflow` 贯穿全程。若 GitHub 认证不可用，先保留本地草稿并明确标记未发布，不把草稿当成已就绪工单。实现阶段逐项记录已迁移/未迁移的模块及验收证据，不以构建成功代替功能验收。

## Agent skills

### Issue tracker

Issues 跟踪于 fork 仓库 `Tften/1Panel` 的 GitHub Issues（使用 `gh` CLI）。见 `docs/agents/issue-tracker.md`。

### Triage labels

沿用五个默认 triage 标签（`needs-triage` / `needs-info` / `ready-for-agent` / `ready-for-human` / `wontfix`）。见 `docs/agents/triage-labels.md`。

### Domain docs

单一上下文布局（根目录 `GLOSSARY.md` + `docs/adr/`）。见 `docs/agents/domain.md`。
