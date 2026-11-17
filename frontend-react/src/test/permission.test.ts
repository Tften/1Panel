import { describe, it, expect } from 'vitest';
import {
    hasPermissionWith,
    hasPermissionMetaAccessWith,
    hasRouteRoleAccessWith,
    hasRouteAccessWith,
    toManageCode,
} from '@/lib/permission';
import type { GlobalStore } from '@/store/global';

const baseState = {
    isAdmin: false,
    permissions: [] as string[],
    masterOnlyPermissions: [] as string[],
    nodeRoles: [],
    currentNode: 'local',
} as unknown as GlobalStore;

describe('权限语义与旧前端一致', () => {
    it('管理员拥有全部权限', () => {
        expect(hasPermissionWith({ ...baseState, isAdmin: true }, 'any')).toBe(true);
    });

    it('空权限为 false', () => {
        expect(hasPermissionWith(baseState, '  ')).toBe(false);
    });

    it('直接命中', () => {
        expect(hasPermissionWith({ ...baseState, permissions: ['website_view'] }, 'website_view')).toBe(true);
    });

    it('view 权限可由 manage 权限覆盖', () => {
        expect(hasPermissionWith({ ...baseState, permissions: ['website_manage'] }, 'website_view')).toBe(true);
        expect(hasPermissionWith({ ...baseState, permissions: ['website_view'] }, 'website_manage')).toBe(false);
    });

    it('master-only 权限在非主节点被拒绝', () => {
        const state = {
            ...baseState,
            permissions: ['setting_view'],
            masterOnlyPermissions: ['setting_view'],
            currentNode: 'node1',
        };
        expect(hasPermissionWith(state, 'setting_view')).toBe(false);
        expect(hasPermissionWith({ ...state, currentNode: 'local' }, 'setting_view')).toBe(true);
    });

    it('adminOnly 仅管理员可访问', () => {
        expect(hasRouteRoleAccessWith({ ...baseState }, { adminOnly: true })).toBe(false);
        expect(hasRouteRoleAccessWith({ ...baseState, isAdmin: true }, { adminOnly: true })).toBe(true);
    });

    it('protectedRoleOnly 需当前节点 Node Admin 角色', () => {
        const state = {
            ...baseState,
            currentNode: 'n1',
            nodeRoles: [{ nodeId: 1, nodeName: 'n1', roleId: 2, roleName: 'Node Admin' }],
        };
        expect(hasRouteRoleAccessWith(state, { protectedRoleOnly: true })).toBe(true);
        expect(hasRouteRoleAccessWith({ ...state, currentNode: 'n2' }, { protectedRoleOnly: true })).toBe(false);
    });

    it('permission 数组任一命中即可', () => {
        expect(hasPermissionMetaAccessWith(baseState, ['a', 'b'])).toBe(false);
        expect(hasPermissionMetaAccessWith({ ...baseState, permissions: ['b'] }, ['a', 'b'])).toBe(true);
        expect(hasPermissionMetaAccessWith(baseState, [])).toBe(true);
    });

    it('路由所有层级 meta 均需满足', () => {
        const state = { ...baseState, permissions: ['website_view'] };
        expect(hasRouteAccessWith(state, [{ permission: 'website_view' }, { adminOnly: true }])).toBe(false);
        expect(hasRouteAccessWith(state, [{ permission: 'website_view' }, {}])).toBe(true);
    });

    it('toManageCode', () => {
        expect(toManageCode('website_view')).toBe('website_manage');
        expect(toManageCode('website_manage')).toBe('');
        expect(toManageCode('')).toBe('');
    });
});
