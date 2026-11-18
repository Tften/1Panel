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
