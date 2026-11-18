# 1Panel React 前端（重构中）

基于 React + TypeScript + Vite + shadcn/ui 的新前端，开发期与 `frontend/`（Vue）并存。**已接入 core 静态嵌入**，可通过正式面板端口访问。

## 访问地址

| 环境 | 地址 |
|------|------|
| 开发机（Vite 热更新） | http://192.168.0.108:4005 |
| 开发机（core 嵌入） | http://192.168.0.108:41397 |
| 安全入口 | `/d8b8d56a15` |

**注意**：core 的安全入口格式是 `/{code}`（如 `/d8b8d56a15`），不是 `/entrance/{code}`。React 路由必须同时支持 `/login`、`/entrance/:code` 和 `/:code` 三种形式。

## 开发

```bash
npm install
npm run dev
```

开发服务端口 4005，`/api` 代理至 `http://localhost:9999/`。需先启动开发版 core 后端。

## 构建与部署

```bash
npm run build        # 产物输出到 ../core/cmd/server/web/
cd ../core && go build -o /tmp/1panel-dev-core ./cmd/server
# 部署到开发机并重启 core
```

**重要**：`vite.config.ts` 中 `emptyOutDir: false`，防止构建时删除 `web.go` 嵌入声明文件。

## 验证

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## 已完成功能

- 登录/退出/会话过期（含验证码流程）
- 首页概览（CPU/内存/磁盘/网络/系统信息）
- 应用商店（列表/详情/安装/已安装管理）
- 网站（列表/创建/SSL/运行环境/模板）
- 数据库（MySQL/PostgreSQL/MongoDB/Redis）
- 容器（列表/镜像/网络/存储卷/Compose）
- 主机（文件/监控/防火墙/SSH/进程/磁盘）
- AI（Ollama/代理/GPU/MCP）
- 计划任务、日志、工具箱、终端、VM
- 设置（面板/许可证/备份账号/快照/API Key/关于）
- 分享页、扩展机制、全局错误提示

## 已知限制

- 部分页面仍是基础列表，缺少创建/编辑表单（如告警、设备管理、ClamAV）
- VM 控制台、MCP 凭证创建、网站详细配置待补齐
- 分页组件在部分页面未实现

## 开发机同步

```bash
# 本机推送
git push

# 开发机拉取并重建
ssh ausu-f15 'cd ~/1Panel && git pull --ff-only'
ssh ausu-f15 'cd ~/1Panel/frontend-react && export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh" && npm run build'
ssh ausu-f15 'cd ~/1Panel/core && export PATH=$HOME/.local/go/bin:$PATH && export GOMODCACHE=$HOME/go/pkg/mod && go build -o /tmp/1panel-dev-core ./cmd/server'
# 重启 core（需 sudo）
```

## 凭据管理

开发机上的敏感信息存储在 `~/1panel-dev-credentials.env`（权限 600），包含 sudo 密码、面板用户名密码。不要提交到仓库。
