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

Git 管理规范（分支流程、Commit Message、风险分级）参考 `git-workflow` skill。

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
| Node/npm | v24.22.1 / 11.19.1（nvm 管理） | nvm 的 `default` 别名已指向 v24.22.1；**非交互 SSH 命令里需先 `export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"`**（或用 `bash -ic`），否则找不到 node |
| 构建验证 | core/agent `go build ./...` 均通过 | agent 编译前需 `bash agent/utils/vm/helper/prepare.sh` 下载 KVM helper 二进制（首次已执行）；core 编译需先有前端产物（占位文件已在 `core/cmd/server/web/` 建过，gitignore 忽略不入库） |
| 尚未安装 | swag（改 API 注解后重新生成 swagger 时才需要） | 需要时装：`go install github.com/swaggo/swag/cmd/swag@latest` |

下载镜像源备注：go.dev 直连很慢（实测 <100KB/s），装工具用阿里云镜像 `https://mirrors.aliyun.com/golang/`；npm 源如慢可换 `npmmirror`。

## Agent skills

### Issue tracker

Issues 跟踪于 fork 仓库 `Tften/1Panel` 的 GitHub Issues（使用 `gh` CLI）。见 `docs/agents/issue-tracker.md`。

### Triage labels

沿用五个默认 triage 标签（`needs-triage` / `needs-info` / `ready-for-agent` / `ready-for-human` / `wontfix`）。见 `docs/agents/triage-labels.md`。

### Domain docs

单一上下文布局（根目录 `GLOSSARY.md` + `docs/adr/`）。见 `docs/agents/domain.md`。
