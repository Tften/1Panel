# 06 · 前端开发

## 技术与目录

Vue 3.5 `<script setup>` + TS + Vite 8 + Element Plus + Pinia + Tailwind 4。

```
frontend/src/
├── api/
│   ├── index.ts            # axios 封装（拦截器、CSRF、CurrentNode 头）
│   ├── config/             # 端口常量
│   ├── interface/          # 类型定义（index.ts 公共类型 + 每域一文件）
│   └── modules/            # 每域一文件（setting.ts/website.ts/…27 个）
├── routers/
│   ├── router.ts           # 路由装配：import.meta.glob 自动收 modules/*.ts + xpack 注入
│   ├── index.ts            # 全局守卫（登录/许可证/RBAC）
│   ├── constant.ts         # Layout 常量
│   └── modules/            # 每域一文件（sort 字段决定菜单顺序）
├── store/modules/         # Pinia：global/menu/process/tabs/terminal…
├── views/                  # 按域组织：每域一目录，复杂页面再分子目录
├── components/             # 全局/通用组件（60+，自动注册：unplugin-vue-components）
├── composables/            # 组合式函数（useGlobalStore/usePageState…）
├── lang/
│   ├── index.ts            # vue-i18n + 按需异步加载语言包
│   ├── fu.ts               # Fit2Cloud UI 组件库内置文案
│   └── modules/            # 12 语言文件（zh.ts 约 7900 行）
├── directives/ extensions/ config/ enums/ typings/ utils/ styles/ assets/
```

## API 层约定

**每个后端接口对应一个导出函数**（`frontend/src/api/modules/setting.ts`）：

```ts
import http from '@/api';
import { ResPage, SearchWithPage } from '../interface';
import { Setting } from '../interface/setting';

export const getMemo = () => http.get<string>(`/core/settings/memo`);
export const updateMemo = (content: string) => http.post(`/core/settings/memo`, { content });
export const searchWebsites = (params: SearchWithPage) =>
    http.post<ResPage<Setting.WebsiteSearch>>(`/websites/search`, params);
```

路径规则：**core 域接口以 `/core` 开头，agent 域直接 `/api/v2` 下相对路径**（baseURL 已是 `/api/v2`，见 `frontend/src/api/index.ts:16`）。不用关心代理细节，`CurrentNode` 头由拦截器统一附加。

axios 封装要点（`frontend/src/api/index.ts`）：

- 请求拦截：自动加 `Accept-Language`、`CurrentNode`（encodeURIComponent）、登录系列接口加 `EntranceCode`、写请求加 `X-CSRF-Token`
- 响应拦截：按业务 code 分发——401 清登录态、`ERR_XPACK`/`ERR_ENTERPRISE` 切许可证页、`NODE_UNBIND` 回落本机节点、`ERR_GLOBAL_LOADING` 触发全局 loading；非 200 默认 `MsgError` 弹错（`skipErrorMessage`/`errorMessageMode: 'manual'` 可关）
- 泛型返回 `ResultData<T>`（`{code, message, data}`，`frontend/src/api/interface/index.ts:9`）
- 分页统一 `ResPage<T>`（`{items, total}`）+ `SearchWithPage` 请求体

## 路由与菜单

**新增页面 = 新建 `routers/modules/xxx.ts` + `views/` 下组件**，`import.meta.glob` 自动收集（`frontend/src/routers/router.ts:6`），无需手工注册。

模块路由模板（参考 `frontend/src/routers/modules/setting.ts:20`）：

```ts
const settingRouter = {
    sort: 12,                          // 菜单顺序
    path: '/settings',
    name: 'Setting-Menu',
    component: Layout,
    redirect: redirectToAvailableSetting,
    meta: { title: 'menu.settings', icon: 'p-config' },   // title 是 i18n key
    children: [
        {
            path: 'panel',
            name: 'Panel',
            component: () => import('@/views/setting/panel/index.vue'),
            hidden: true,              // 不进侧边栏
            meta: { parent: 'menu.settings', title: 'setting.panel', activeMenu: '/settings', adminOnly: true },
        },
    ],
};
export default settingRouter;
```

meta 权限字段（`frontend/src/utils/rbac.ts:34`）：`adminOnly`、`protectedRoleOnly`、`permission: string | string[]`（多值任一满足）。

全局守卫（`frontend/src/routers/index.ts:32`）依次处理：未登录 → entrance/login；企业版许可证校验；`hasRouteAccess(to)` RBAC 校验。菜单可见性后端也可控（DB `HideMenu` setting + `core/init/migration/helper/menu.go`）。

## 状态管理（Pinia）

`store/modules/global.ts:13` 的 GlobalStore 是核心：登录态、语言、主题、`currentNode`（多节点切换）、权限集（`permissions/masterOnlyPermissions/nodeRoles`）、许可证状态。持久化经 `pinia-plugin-persistedstate`（`config/pinia-persist`）。

权限运行时：`syncAuthInfo()` 拉取用户信息写入 store（`frontend/src/utils/rbac.ts:25`），页面用 `hasPermission('xxx_view')` / `hasRouteRoleAccess(meta)` 控制。

## i18n（前端）

- **必须**所有 UI 文案走 `t('xxx.yyy')`，key 在 `lang/modules/zh.ts`（单文件按域分顶层 namespace：commons/menu/setting/website…，见 `frontend/src/lang/modules/zh.ts:52`）
- 语言包按需异步加载（`frontend/src/lang/index.ts:22`），新增 key 只改 ts 文件
- 新增功能域：在 12 个语言文件里同步加 namespace——至少 zh/en 必须完整，其余语言可后补（缺失回落 en）
- 顺序参数用 `{0}`（vue-i18n 列表语法），如 `'删除"{0}"吗？'`

## 组件与工具

- Element Plus 组件**模板自动导入**（unplugin-vue-components + ElementPlusResolver），图标经 `@element-plus/icons-vue` 全局注册；`SvgIcon`（iconfont `p-*` 图标）全局注册（`frontend/src/main.ts:31`）
- 通用组件在 `components/`：`confirm-dialog`、`del-dialog`、`dialog-pro/drawer-pro`、`error-message/error-prompt`、`config-card`、`back-button`、`codemirror-pro`…… 新页面优先复用
- 提示统一走 `MsgError/MsgSuccess/MsgWarning`（`utils/message`），不要直接 ElMessage
- `composables/usePageState.ts` 管理页面状态缓存（配合面板 tab 缓存）
- Vue API（ref/computed…）经 unplugin-auto-import 自动导入，模板内无需 import

## 质量门槛

- 类型检查：`npm run type-check`（vue-tsc）
- Lint：`eslint --fix` + `prettier`，lint-staged 钩子见 `frontend/lint-staged.config.js`
- 提交前自查：`npm run lint:eslint && npm run type-check`
