# React 前端扩展机制

## 扩展路由注册

新前端支持通过约定方式注册扩展路由，无需修改核心代码。

### 目录约定

```
frontend-react/src/extensions/
├── routes.ts          # 扩展路由注册入口
└── modules/
    └── example.ts     # 示例扩展模块
```

### 注册方式

在 `src/extensions/routes.ts` 中导出扩展路由：

```typescript
import type { AppRoute } from '@/router/types';

export const extensionRoutes: AppRoute[] = [
    {
        path: '/extensions/example',
        name: 'ExampleExtension',
        meta: {
            title: '扩展示例',
            icon: 'p-extension',
            permission: 'extension_view',
        },
        children: [
            {
                path: '/extensions/example',
                name: 'ExamplePage',
                component: 'extensions/example',
            },
        ],
    },
];
```

### 路由元数据

与核心路由一致，支持：
- `title`: 菜单标题（i18n key）
- `icon`: 图标标识
- `permission`: 权限码
- `adminOnly`: 仅管理员可见
- `hidden`: 不在菜单显示
- `sort`: 菜单排序

### 页面组件

扩展页面放在 `src/pages/extensions/` 目录下，使用与核心页面相同的组件和 API 适配层。

## 从 Vue 扩展迁移

### 主要变更

1. **组件语法**: Vue SFC → React JSX
2. **状态管理**: Pinia → Zustand
3. **路由**: Vue Router → React Router
4. **UI 组件**: Element Plus → shadcn/ui
5. **国际化**: vue-i18n → react-i18next

### 迁移步骤

1. 将 Vue 路由配置转换为 `AppRoute` 格式
2. 将 Vue 组件模板转换为 JSX
3. 将 Pinia store 替换为 Zustand store
4. 将 Element Plus 组件替换为 shadcn/ui 组件
5. 将 API 调用从 `@/api` 替换为 `@/lib/http`

### 不兼容点

- 旧 Vue 扩展的 `.vue` 文件无法直接运行
- 需要手动迁移所有 Vue 特定语法（`v-if`, `v-for`, `@click` 等）
- Element Plus 组件需要逐一替换为 shadcn/ui 等价物

## 示例扩展

参见 `src/extensions/modules/example.ts` 和 `src/pages/extensions/example.tsx`。
