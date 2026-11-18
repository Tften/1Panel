# React 前端重构交接文档

> 写给下一个 agent：本文档是当前重构的**唯一入口**，读完即可接手。所有“为什么这么做”都在 [AGENTS.md](../AGENTS.md) 的「已踩过的坑」清单里，别再重复排查。

## 1. 项目背景与目标

将 1Panel 的前端从 **Vue 3 + Element Plus + Pinia** 完整迁移到 **React 19 + TypeScript + Vite 8 + 官方 shadcn/ui（Base UI）**，业务行为与后端 API 契约不变。旧前端 `frontend/` 源码与构建能力保留，可回退。

父规格 Issue：[Tften/1Panel #1](https://github.com/Tften/1Panel/issues/1)。所有 20 张子工单在 #1 下，原生阻塞边已配置。

## 2. 当前状态速览

| 维度 | 状态 |
|------|------|
| 分支 | `fea/react-frontend-rebuild`（基于 `dev`，已推送 origin） |
| 最新提交 | `0a7aa9419` 入口码路由正则 |
| 构建 | `npm run build` 通过，产物嵌入 `core/cmd/server/web/` |
| 验收 | `lint` / `typecheck` / 30 项测试全通过 |
| 运行 | 开发机 `41397` 端口由 core 嵌入服务，已实测登录、首页、应用商店、文件管理、容器、数据库、日志、设置、MCP、终端均可用 |
| 开发机热更新 | Vite `:4005`（代理 `/api` → `:41397`） |

**关键认知**：已实现的页面是“**真实接口驱动的列表与主流程**”，**不是** 1:1 复刻旧 UI。大量复杂配置弹窗、批量操作、富文本/终端/控制台尚未迁移。详见第 5 节。

## 3. 目录与运行方式

```
frontend-react/                 # 新前端独立工程（React + shadcn）
├── src/
│   ├── api/                    # API 适配（与旧接口路径/字段一一对应）
│   ├── components/layout.tsx   # 侧栏+顶部用户菜单
│   ├── components/ui/          # shadcn 组件（Base UI，非 Radix）
│   ├── i18n/                   # 12 语言包（复制自旧 lang/）
│   ├── lib/http.ts             # 请求封装（CSRF/EntranceCode/CurrentNode/错误分发）
│   ├── lib/permission.ts       # RBAC 权限判断
│   ├── pages/<域>/             # 页面
│   ├── router/modules.ts       # 路由元数据（与旧 Vue Router 对应）
│   ├── store/global.ts         # Zustand（登录/主题/节点/权限）
│   └── App.tsx                 # 路由入口
├── docs/module-parity.md       # 95 条路由对照清单
└── vite.config.ts              # 产物输出到 core/cmd/server/web（emptyOutDir:false）
```

运行：`cd frontend-react && npm install && npm run dev`。core 重建见 [AGENTS.md 开发机章节](../AGENTS.md)。

## 4. 已验证通过（实测）

| 页面 | 路径 | 验证结果 |
|------|------|---------|
| 登录 | `/d8b8d56a15` | 正常登录、验证码流程可用 |
| 首页 | `/` | CPU/内存/磁盘/网络/系统信息 |
| 应用商店 | `/apps` | 266 个应用、分类、图标、安装链接 |
| 已安装应用 | `/apps/installed` | 启停/重启按钮、版本/端口/路径 |
| 文件管理 | `/hosts/files` | 目录列表、新建目录、文件下载 |
| 容器 | `/containers` | 19 个容器（state/orderBy/order 必填已修） |
| MySQL | `/databases/mysql` | 创建表单、列表、删除 |
| 日志 | `/logs` | 操作/登录/任务日志三个 tab |
| 设置 | `/settings` | 读取/保存面板配置 |
| MCP | `/ai/mcp` | 服务状态、凭证列表 |
| AI 代理 | `/ai/agents/agent` | 代理列表、GPU 状态 |
| 终端 | `/terminal` | 主机列表（**单数**，与 core 白名单一致） |

## 5. 尚未完成（下一步工作清单）

### 高优先级（影响主流程）

1. **网站详细配置页** `/websites/:id/config/:tab` — 域名、目录、日志、SSL 绑定。
2. **SSL 申请/上传/续签** — 当前仅列表+删除。
3. **计划任务编辑/执行记录** — 当前仅创建+删除。
4. **容器创建/编辑、镜像拉取、Compose 编辑** — 当前仅列表+启停。
5. **数据库远程实例连接、备份恢复** — 当前仅本地列表。
6. **终端 WebSocket 连接** — 当前仅主机列表，无终端。
7. **VM 控制台** — 当前仅列表。

### 中优先级（补齐列表→表单）

- 设置子页面：告警、备份账号创建、快照创建/恢复、许可证上传
- 工具箱：ClamAV、清理、设备管理
- AI：Ollama 模型创建、MCP 服务创建、模型服务列表
- 文件管理：上传、批量操作、权限编辑、压缩解压
- 主机：防火墙规则创建/删除、SSH 配置编辑、进程停止、磁盘挂载

### 低优先级

- 分页组件统一化（部分页面写死 100 条）
- 空态组件统一
- 主题品牌色持久化联动
- 移动端细节适配
- `frontend-react/src/pages/containers/resource.tsx` 有一个 `react-hooks/exhaustive-deps` warning，可修可不修

## 6. 工单与状态对齐（重要）

**已关闭**：#2（骨架）、#3（布局）、#4（首页）。**其余 17 张工单仍 open**，但其中大部分已有页面实现。下任 agent 应按第 5 节逐项核对后**再关闭对应工单**，不要把“有页面”当成“功能完整”。

对照清单在 `frontend-react/docs/module-parity.md`（95 条路由，含权限/隐藏标记），每项完成需更新为已迁移并附验证证据。

## 7. 代码审查与规范

- **官方 shadcn/ui 是 Base UI 不是 Radix**：`asChild` 不存在，用 `render` prop；`Select` 的 `onValueChange` 参数是 `string | null`，要 `?? ''`。
- **React 19 lint**：`set-state-in-effect` 禁用同步 setState；组件创建不能在 render 里（用 `createElement` 或提取）。
- **API 路径必须前导 `/`**：`http.post('/apps/search', ...)`，否则拼成 `/api/v2apps/...`。
- **必填字段**：容器搜索必须带 `state/orderBy/order`；登录必须带 `language`；密码用 `encryptPassword`（RSA+AES）。
- **CSRF/EntranceCode/CurrentNode** 由 `lib/http.ts` 统一注入，不要手工拼。
- **入口码路由** `/:code([a-zA-Z0-9]{8,16})` 必须与业务路径隔离，否则 `/terminal` 被当成入口码。

## 8. 交接后的第一步建议

1. `git pull`，`npm run build` 确认构建绿。
2. 打开开发机面板实测一遍第 4 节列出的页面，确认无回归。
3. 从「高优先级」清单挑一项（推荐网站详细配置页，它是网站主流程最大缺口），按旧前端对应 Vue 文件补齐交互，更新 `module-parity.md` 后关闭对应工单。
4. 每完成一项就构建部署实测，避免批量引入回归。

## 9. 文档索引

- 仓库约定与踩坑清单：[AGENTS.md](../AGENTS.md)
- 新前端 README：[frontend-react/README.md](../frontend-react/README.md)
- 路由对照清单：[frontend-react/docs/module-parity.md](../frontend-react/docs/module-parity.md)
- 扩展机制：[frontend-react/docs/extensions.md](../frontend-react/docs/extensions.md)
- 规格草稿：[docs/dev/react-frontend-spec-draft.md](./react-frontend-spec-draft.md)
- 工单总入口：[GitHub Issue #1](https://github.com/Tften/1Panel/issues/1)
