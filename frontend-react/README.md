# 1Panel React 前端（重构中）

基于 React + TypeScript + Vite + shadcn/ui 的新前端，开发期与 `frontend/`（Vue）并存。**尚未接入正式面板入口**，所有未迁移模块以 [docs/module-parity.md](docs/module-parity.md) 为准。

## 开发

```bash
npm install
npm run dev
```

开发服务端口 4005，`/api` 代理至 `http://localhost:9999/`。需先启动开发版 core 后端，再访问 `/login` 或 `/entrance/:code`。

## 验证

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## 当前范围（工单 #2）

- 真实登录、退出、会话过期跳转；MFA/Passkey/OIDC/SAML 登录方式尚未迁移
- API 适配层：语言头、当前节点头、EntranceCode、CSRF、业务码分发与错误提示
- 12 个语言包按需加载，缺失回退英文；主题切换与偏好持久化
- 权限与会话状态；API 请求与权限规则自动化测试

API 适配层对 `http.ts` 的 `onRedirect`/`onReload` 使用回调桥接，避免依赖 React Router 形成循环依赖。
