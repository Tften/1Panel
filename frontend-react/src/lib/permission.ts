import { useGlobalStore, type GlobalStore } from '@/store/global';

export type PermissionMetaValue = string | string[];

export interface RouteAccessMeta {
    adminOnly?: boolean;
    protectedRoleOnly?: boolean;
    permission?: PermissionMetaValue;
}

export const toManageCode = (permission: string): string => {
    if (!permission) return '';
    return permission.endsWith('_view') ? permission.replace(/_view$/, '_manage') : '';
};

const isMasterOnly = (state: GlobalStore, permission: string) =>
    state.masterOnlyPermissions.includes(permission);

export const hasPermissionWith = (state: GlobalStore, permission: string): boolean => {
    const normalized = permission.trim();
    if (!normalized) return false;
    if (state.currentNode !== 'local' && isMasterOnly(state, normalized)) return false;
    if (state.isAdmin) return true;
    if (state.permissions.includes(normalized)) return true;
    const manage = toManageCode(normalized);
    if (!manage) return false;
    if (state.currentNode !== 'local' && isMasterOnly(state, manage)) return false;
    return state.permissions.includes(manage);
};

export const hasPermission = (permission: string) =>
    hasPermissionWith(useGlobalStore.getState(), permission);

export const hasPermissionMetaAccessWith = (
    state: GlobalStore,
    permission?: PermissionMetaValue,
): boolean => {
    if (!permission) return true;
    if (Array.isArray(permission)) {
        const list = permission.filter(Boolean);
        return list.length === 0 || list.some((item) => hasPermissionWith(state, item));
    }
    return hasPermissionWith(state, permission);
};

export const hasRouteRoleAccessWith = (state: GlobalStore, meta?: RouteAccessMeta): boolean => {
    if (!meta) return true;
    if (state.isAdmin) return true;
    if (meta.adminOnly && !state.isAdmin) return false;
    if (meta.protectedRoleOnly) {
        return state.nodeRoles.some(
            (item) => item.nodeName === state.currentNode && item.roleName === 'Node Admin',
        );
    }
    return true;
};

export const hasRouteAccessWith = (state: GlobalStore, metas: RouteAccessMeta[]): boolean =>
    metas.every((meta) => hasRouteRoleAccessWith(state, meta)) &&
    metas.every((meta) => hasPermissionMetaAccessWith(state, meta.permission));

export const hasRouteAccess = (metas: RouteAccessMeta[]) =>
    hasRouteAccessWith(useGlobalStore.getState(), metas);
