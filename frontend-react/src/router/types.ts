import type { PermissionMetaValue } from '@/lib/permission';

export interface RouteMeta {
    title?: string;
    icon?: string;
    permission?: PermissionMetaValue;
    adminOnly?: boolean;
    protectedRoleOnly?: boolean;
    activeMenu?: string;
    ignoreTab?: boolean;
    detail?: string;
    key?: string;
}

export interface AppRoute {
    path: string;
    name: string;
    sort?: number;
    redirect?: string;
    hidden?: boolean;
    props?: boolean;
    meta?: RouteMeta;
    children?: AppRoute[];
    component?: string;
}
