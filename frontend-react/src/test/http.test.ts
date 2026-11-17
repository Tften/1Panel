import { describe, it, expect, vi } from 'vitest';
import { HttpClient, ApiError, isCsrfForbidden } from '@/lib/http';
import { ResultEnum } from '@/lib/constants';
import { useGlobalStore } from '@/store/global';

const jsonResponse = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });

const makeClient = (overrides: Partial<ConstructorParameters<typeof HttpClient>[0]> = {}) => {
    const onRedirect = vi.fn();
    const onError = vi.fn();
    const onReload = vi.fn();
    const client = new HttpClient({
        baseURL: '/api/v2',
        fetchImpl: vi.fn().mockResolvedValue(jsonResponse({ code: 200, message: '', data: {} })),
        getCookie: (name) => (name === 'pcsrftoken' ? 'csrf-abc' : undefined),
        onRedirect,
        onError,
        onReload,
        ...overrides,
    });
    return { client, onRedirect, onError, onReload };
};

describe('请求头构造', () => {
    it('附加语言、当前节点（编码后）头', async () => {
        const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ code: 200, message: '', data: {} }));
        const { client } = makeClient({ fetchImpl });
        useGlobalStore.setState({ language: 'zh', currentNode: 'node 1' });
        await client.get('/core/auth/current');
        const headers = fetchImpl.mock.calls[0][1].headers;
        expect(headers['Accept-Language']).toBe('zh');
        expect(headers.CurrentNode).toBe(encodeURIComponent('node 1'));
    });

    it('登录接口附加 EntranceCode（Base64）', async () => {
        const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ code: 200, message: '', data: {} }));
        const { client } = makeClient({ fetchImpl });
        useGlobalStore.setState({ entrance: 'abc123' });
        await client.post('/core/auth/login', {});
        const headers = fetchImpl.mock.calls[0][1].headers;
        expect(headers.EntranceCode).toBe(btoa('abc123'));
    });

    it('写请求附加 CSRF token，读请求不加', async () => {
        const fetchImpl = vi.fn().mockImplementation(() =>
            Promise.resolve(jsonResponse({ code: 200, message: '', data: {} })),
        );
        const { client } = makeClient({ fetchImpl });
        await client.get('/x');
        expect(fetchImpl.mock.calls[0][1].headers['X-CSRF-Token']).toBeUndefined();
        await client.post('/x', {});
        expect(fetchImpl.mock.calls[1][1].headers['X-CSRF-Token']).toBe('csrf-abc');
        expect(useGlobalStore.getState().csrfToken).toBe('csrf-abc');
    });

    it('显式 CurrentNode 头会被编码而非覆盖', async () => {
        const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ code: 200, message: '', data: {} }));
        const { client } = makeClient({ fetchImpl });
        await client.get('/x', { headers: { CurrentNode: 'a b' } });
        expect(fetchImpl.mock.calls[0][1].headers.CurrentNode).toBe(encodeURIComponent('a b'));
    });
});

describe('业务码分发', () => {
    it('200 返回数据', async () => {
        const { client } = makeClient();
        const res = await client.get('/x');
        expect(res.code).toBe(200);
    });

    it('401/403 业务码：清登录态并跳 entrance', async () => {
        const onRedirect = vi.fn();
        const fetchImpl = vi
            .fn()
            .mockResolvedValue(jsonResponse({ code: ResultEnum.OVERDUE, message: 'expired', data: {} }));
        const { client } = makeClient({ fetchImpl, onRedirect });
        useGlobalStore.setState({ isLogin: true, entrance: 'mycode' });
        await expect(client.get('/x')).rejects.toBeInstanceOf(ApiError);
        expect(useGlobalStore.getState().isLogin).toBe(false);
        expect(onRedirect).toHaveBeenCalledWith({ type: 'entrance', entrance: 'mycode' });
    });

    it('313 跳 expired', async () => {
        const onRedirect = vi.fn();
        const fetchImpl = vi
            .fn()
            .mockResolvedValue(jsonResponse({ code: ResultEnum.EXPIRED, message: 'mfa expired', data: {} }));
        const { client } = makeClient({ fetchImpl, onRedirect });
        await expect(client.get('/x')).rejects.toBeInstanceOf(ApiError);
        expect(onRedirect).toHaveBeenCalledWith({ type: 'expired' });
    });

    it('412 RBAC：默认提示，manual 模式不提示', async () => {
        const fetchImpl = vi
            .fn()
            .mockResolvedValue(jsonResponse({ code: ResultEnum.ERR_RBAC, message: 'no perm', data: {} }));
        const { client, onError } = makeClient({ fetchImpl });
        await expect(client.get('/x')).rejects.toThrow();
        expect(onError).toHaveBeenCalledWith('no perm');
        onError.mockClear();
        await expect(client.get('/x', { errorMessageMode: 'manual' })).rejects.toThrow();
        expect(onError).not.toHaveBeenCalled();
    });

    it('410 重置产品态并触发 reload', async () => {
        const fetchImpl = vi
            .fn()
            .mockResolvedValue(jsonResponse({ code: ResultEnum.ERR_XPACK, message: '', data: {} }));
        const onReload = vi.fn();
        const { client } = makeClient({ fetchImpl, onReload });
        useGlobalStore.setState({ isProductPro: true });
        await expect(client.get('/x')).rejects.toThrow();
        expect(useGlobalStore.getState().isProductPro).toBe(false);
        expect(onReload).toHaveBeenCalled();
    });

    it('413 跳企业许可证页', async () => {
        const onRedirect = vi.fn();
        const fetchImpl = vi
            .fn()
            .mockResolvedValue(jsonResponse({ code: ResultEnum.ERR_ENTERPRISE, message: '', data: {} }));
        const { client } = makeClient({ fetchImpl, onRedirect });
        await expect(client.get('/x')).rejects.toThrow();
        expect(onRedirect).toHaveBeenCalledWith({ type: 'enterprise-license' });
    });

    it('411 节点解绑跳 node-unbind', async () => {
        const onRedirect = vi.fn();
        const fetchImpl = vi
            .fn()
            .mockResolvedValue(jsonResponse({ code: ResultEnum.NODE_UNBIND, message: '', data: {} }));
        const { client } = makeClient({ fetchImpl, onRedirect });
        await expect(client.get('/x')).rejects.toThrow();
        expect(onRedirect).toHaveBeenCalledWith({ type: 'node-unbind' });
    });

    it('407 全局 loading，不抛错', async () => {
        const fetchImpl = vi
            .fn()
            .mockResolvedValue(jsonResponse({ code: ResultEnum.ERR_GLOBAL_LOADING, message: 'loading', data: {} }));
        const { client } = makeClient({ fetchImpl });
        const res = await client.get('/x');
        expect(res.code).toBe(407);
        expect(useGlobalStore.getState().isLoading).toBe(true);
        expect(useGlobalStore.getState().loadingText).toBe('loading');
    });

    it('406 ERR_AUTH 直接返回不抛错', async () => {
        const fetchImpl = vi
            .fn()
            .mockResolvedValue(jsonResponse({ code: ResultEnum.ERR_AUTH, message: 'auth', data: {} }));
        const { client } = makeClient({ fetchImpl });
        const res = await client.get('/x');
        expect(res.code).toBe(406);
    });

    it('500 业务码默认提示并抛错，skipErrorMessage 抑制提示', async () => {
        const fetchImpl = vi
            .fn()
            .mockResolvedValue(jsonResponse({ code: 500, message: 'boom', data: {} }));
        const { client, onError } = makeClient({ fetchImpl });
        await expect(client.get('/x')).rejects.toThrow();
        expect(onError).toHaveBeenCalledWith('boom');
        onError.mockClear();
        await expect(client.get('/x', { skipErrorMessage: true })).rejects.toThrow();
        expect(onError).not.toHaveBeenCalled();
    });

    it('operation not permitted 映射到 tamper 提示', async () => {
        const fetchImpl = vi
            .fn()
            .mockResolvedValue(jsonResponse({ code: 500, message: 'Operation Not Permitted', data: {} }));
        const { client, onError } = makeClient({ fetchImpl });
        await expect(client.get('/x')).rejects.toThrow();
        expect(onError).toHaveBeenCalledWith('license.tamperHelper');
    });
});

describe('HTTP 状态错误', () => {
    it('403 且 message 含 csrf token invalid：不跳登录，直接抛错', async () => {
        const onRedirect = vi.fn();
        const fetchImpl = vi
            .fn()
            .mockResolvedValue(jsonResponse({ message: 'CSRF Token Invalid' }, 403));
        const { client } = makeClient({ fetchImpl, onRedirect });
        await expect(client.post('/x', {})).rejects.toThrow();
        expect(onRedirect).not.toHaveBeenCalled();
    });

    it('403 非 CSRF：提示并跳 entrance', async () => {
        const onRedirect = vi.fn();
        const onError = vi.fn();
        const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ message: 'forbidden' }, 403));
        const { client } = makeClient({ fetchImpl, onRedirect, onError });
        await expect(client.get('/x')).rejects.toThrow();
        expect(onRedirect).toHaveBeenCalledWith({ type: 'entrance', entrance: '' });
        expect(onError).toHaveBeenCalledWith('forbidden');
    });

    it('313 HTTP 状态跳 expired', async () => {
        const onRedirect = vi.fn();
        const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ message: '' }, 313));
        const { client } = makeClient({ fetchImpl, onRedirect });
        await expect(client.get('/x')).rejects.toThrow();
        expect(onRedirect).toHaveBeenCalledWith({ type: 'expired' });
    });
});

describe('isCsrfForbidden', () => {
    it('大小写不敏感匹配', () => {
        expect(isCsrfForbidden('CSRF token invalid')).toBe(true);
        expect(isCsrfForbidden('csrf TOKEN INVALID')).toBe(true);
        expect(isCsrfForbidden('other')).toBe(false);
        expect(isCsrfForbidden(undefined)).toBe(false);
    });
});
