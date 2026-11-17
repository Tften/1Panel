import type { AppRoute } from './types';

export const routes: AppRoute[] = [
    {
        path: '/',
        name: 'Home-Menu',
        redirect: '/',
        meta: { title: 'menu.home', icon: 'p-home' },
        children: [
            {
                path: '/',
                name: 'home',
                component: 'home',
            },
        ],
    },
];
