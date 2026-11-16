# 03 · 请求生命周期

理解一次请求如何流转，是二开最重要的地图。

## core 全局中间件链（注册顺序即执行顺序）

`core/init/router/router.go:71` 装配，自上而下：

| # | 中间件 | 作用 |
| :--- | :--- | :--- |
| 1 | `AuditClientIP` | 解析真实客户端 IP（处理代理头） |
| 2-4 | `MCPErrorMetadata / MCPTokenBoundary / MCPAPIIdentity` | MCP 请求识别与边界处理 |
| 5 | `i18n.UseI18n()` | 按 `Accept-Language` 头设置请求级 Localizer（`core/i18n/i18n.go:133`） |
| 6-7 | `WhiteAllow / BindDomain` | IP 白名单、绑定域名访问限制 |
| — | 静态资源 | `/public` `/assets` `/`（前端 SPA）与安全入口路由 |
| 8 | `FrontendFallback` | 非 API 路径回退到 index.html |
| 9 | `WebSocketOriginGuard` | WS 来源校验 |
| 10 | `OperationLog` | 写操作审计日志（见 05） |
| 11 | `GlobalLoading` | 升级等场景的全局 loading 状态拦截 |
| 12 | `xpack.AuthProvider.CoreAPIAuthMiddleware()` | **API Key 认证**（`1Panel-Token`/`1Panel-Timestamp` HMAC 签名，`core/app/auth/api_auth.go:40`） |
| 13 | `PasswordExpired` | 密码过期拦截（跳转改密页） |
| 14 | `CSRFTokenGuard` | 非 GET 请求校验 `X-CSRF-Token` |
| 15 | `xpack.AuthProvider.CoreRBACMiddlewares()` | RBAC 权限（xpack） |
| 16 | `Proxy(...)` | **core→agent 代理**（见下） |

业务路由组 `/api/v2/core` 额外挂 `SetPasswordPublicKey`（登录密码 RSA 公钥下发），各域路由再自行挂 `SessionAuth()`（`core/middleware/session.go:12`：session 校验 + 按需续期，API 请求/匿名路径跳过）。

## 认证体系（三条通道）

1. **Session（浏览器）**：登录成功后写入内存 session（`core/init/session/psession`，gob 序列化 `SessionUser`）；`SessionAuth` 中间件校验并按 `SessionTimeout` 设置续期。**重启进程即失效**。
2. **API Key（程序调用）**：请求头 `1Panel-Token: hex(HMAC-SHA256(key, "1panel:"+ts))` + `1Panel-Timestamp`（旧版 md5 也兼容，`core/cmd/server/main.go:20` 有完整说明）。校验逻辑在 `core/app/auth/api_auth.go`，通过后 `c.Set("API_AUTH", true)`。
3. **节点间 mTLS（agent 非 master 模式）**：core 持证书访问远程 agent；agent 侧 `Certificate()` 中间件（`agent/middleware/certificate.go:22`）验证 + `Proxy-Id` 防重放。

前端配合：axios 拦截器自动附 `Accept-Language`、`CurrentNode`、CSRF 头、登录时 `EntranceCode`（`frontend/src/api/index.ts:35`）。

## core→agent 代理（核心）

`Proxy` 中间件（`core/init/router/proxy.go:40`）处理所有非 `/api/v2/core` 前缀请求：

```
请求 /api/v2/websites/... （无 /core 前缀）
  ↓ ShouldProxyToAgent(path) == true
  ↓ 取目标节点：query 参数 operateNode 优先，否则 CurrentNode 头
  ↓ checkSession 校验（未登录 401）
  ↓ isInternalOnlyAgentEndpoint?（/api/v2/internal/* 等仅内部端点 → 403）
  ↓ useLocalAgent（节点为 local 或空）?
  │    是 → proxyLocalAgent(c)   # httputil.ReverseProxy → unix:///etc/1panel/agent.sock
  │    否 → xpack.MultiNodeProvider.Proxy(c, currentNode)  # 企业版多节点（社区版无远程节点）
  ↓ c.Abort()  # 代理后终止后续链
```

关键细节：

- 反向代理定义在 `core/init/proxy/proxy.go:34`：`DialContext` 强制走 unix socket；转发时透传 `Forwarded/X-Forwarded-*` 并还原真实客户端 IP
- 路径**原样转发**：core 收到 `/api/v2/websites/search`，agent 侧就收到同样路径（agent 路由组前缀恰为 `/api/v2`）
- 因此**新增 agent 业务路由时无需在 core 注册任何东西**，代理自动可达；只有 core 自己的域（`/api/v2/core/*`）才在 core 侧实现
- `isLocalAPI`（`core/init/router/proxy.go:205`）列出的三个 `/api/v2/core/xpack/*` 路径会被转发给 agent —— 例外中的例外，慎动

## 一次典型写请求的完整时序（浏览器 → agent）

```
1. 前端 POST /api/v2/websites（CurrentNode=local，X-CSRF-Token）
2. core: AuditClientIP → i18n → OperationLog（记入审计，等响应后落库）
3. core: CSRF 校验 → SessionAuth（core 域）或 Proxy（agent 域）
4. core→agent: Unix socket 转发，附 X-Panel-User 等头
5. agent: gin.Default()（Logger+Recovery）→ UseI18n → OperationResolveMeta
       →（非 master 时 Certificate mTLS 校验）→ 业务路由 handler
6. agent api 层: CheckBindAndValidate → service → repo(global.DB)
7. 错误: buserr.New("ErrXxx") → helper.ErrorWithDetail → i18n 翻译 → 前端 MsgError 弹窗
8. 成功: { code: 200, data: ... } JSON
```

## 响应格式约定

统一 `dto.Response`（`core/app/api/v2/helper/helper.go:17`）：

```json
{ "code": 200, "message": "success", "data": { ... } }
```

- 业务错误 HTTP 状态仍为 **200**，靠 `code` 字段区分（`ErrCaptchaCode/ErrAuth/ErrLoginLocked` 强制 401，`ErrRBAC` 强制 412）
- 真正的 HTTP 4xx/5xx 仅用于代理失败、CSRF（403）、超时等框架层问题
- 前端拦截器按 `code` 分发：401 清登录、412 RBAC、xpack 相关码切 license 页（`frontend/src/api/index.ts:79`）
