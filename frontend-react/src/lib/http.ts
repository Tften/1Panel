import { ResultEnum, LOGIN_ENDPOINTS } from '@/lib/constants';
import { useGlobalStore } from '@/store/global';

export interface ResultData<T = unknown> {
    code: number;
    message: string;
    data: T;
}

export interface RequestConfig {
    skipErrorMessage?: boolean;
    errorMessageMode?: 'default' | 'manual';
    timeout?: number;
    headers?: Record<string, string>;
}

export class ApiError<T = unknown> extends Error {
    readonly data: ResultData<T> | undefined;
    readonly status: number | undefined;
    constructor(message: string, data?: ResultData<T>, status?: number) {
        super(message);
        this.name = 'ApiError';
        this.data = data;
        this.status = status;
    }
}

export interface AuthRedirect {
    type: 'entrance' | 'expired' | 'enterprise-license' | 'reload' | 'node-unbind' | 'offline';
    entrance?: string;
}

type ErrorNotifier = (message: string) => void;

export interface HttpClientOptions {
    baseURL: string;
    fetchImpl?: typeof fetch;
    getCookie?: (name: string) => string | undefined;
    onRedirect?: (redirect: AuthRedirect) => void;
    onError?: ErrorNotifier;
    onReload?: () => void;
    now?: () => number;
}

const defaultGetCookie = (name: string): string | undefined => {
    if (typeof document === 'undefined') return undefined;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
};

export const isCsrfForbidden = (message: unknown): boolean =>
    typeof message === 'string' && message.toLowerCase().includes('csrf token invalid');

const encodeBase64 = (value: string): string => {
    return btoa(unescape(encodeURIComponent(value)));
};

export class HttpClient {
    private readonly baseURL: string;
    private readonly fetchImpl: typeof fetch;
    private readonly getCookie: (name: string) => string | undefined;
    private readonly onRedirect: (redirect: AuthRedirect) => void;
    private readonly onError: ErrorNotifier;
    private readonly onReload: () => void;

    constructor(options: HttpClientOptions) {
        this.baseURL = options.baseURL;
        this.fetchImpl = options.fetchImpl ?? ((...args) => globalThis.fetch(...args));
        this.getCookie = options.getCookie ?? defaultGetCookie;
        this.onRedirect = options.onRedirect ?? (() => undefined);
        this.onError = options.onError ?? (() => undefined);
        this.onReload = options.onReload ?? (() => undefined);
    }

    private buildHeaders(url: string, method: string, config?: RequestConfig): Record<string, string> {
        const state = useGlobalStore.getState();
        const headers: Record<string, string> = {
            'Accept-Language': state.language,
            ...config?.headers,
        };
        headers.CurrentNode = encodeURIComponent(headers.CurrentNode ?? state.currentNode);
        if (LOGIN_ENDPOINTS.has(url)) {
            headers.EntranceCode = encodeBase64(state.entrance);
        }
        if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method.toUpperCase())) {
            const csrfToken = this.getCookie('pcsrftoken');
            if (csrfToken) {
                headers['X-CSRF-Token'] = csrfToken;
                useGlobalStore.getState().setCsrfToken(csrfToken);
            }
        }
        return headers;
    }

    private handleBusinessCode<T>(
        data: ResultData<T>,
        config?: RequestConfig,
    ): ResultData<T> | Promise<ResultData<T>> {
        const store = useGlobalStore.getState();
        const manual = config?.errorMessageMode === 'manual';
        switch (data.code) {
            case ResultEnum.OVERDUE:
            case ResultEnum.FORBIDDEN:
                store.clearAuthInfo();
                this.onRedirect({ type: 'entrance', entrance: store.entrance });
                throw new ApiError(data.message, data);
            case ResultEnum.EXPIRED:
                this.onRedirect({ type: 'expired' });
                throw new ApiError(data.message, data);
            case ResultEnum.ERR_RBAC:
                if (!manual) this.onError(data.message);
                throw new ApiError(data.message, data);
            case ResultEnum.ERR_XPACK:
                store.setProductPro(false);
                this.onReload();
                throw new ApiError(data.message, data);
            case ResultEnum.ERR_ENTERPRISE:
                store.setEnterpriseLicensed(false);
                this.onRedirect({ type: 'enterprise-license' });
                throw new ApiError(data.message, data);
            case ResultEnum.NODE_UNBIND:
                this.onRedirect({ type: 'node-unbind' });
                throw new ApiError(data.message, data);
            case ResultEnum.ERR_GLOBAL_LOADING:
                store.setLoading(true, data.message);
                return data;
            case ResultEnum.ERR_AUTH:
                return data;
            case ResultEnum.SUCCESS:
            case 0:
            case undefined:
                store.setLoading(false);
                return data;
            default: {
                store.setLoading(false);
                if (!manual) {
                    if (data.message?.toLowerCase().includes('operation not permitted')) {
                        this.onError('license.tamperHelper');
                    } else if (!config?.skipErrorMessage) {
                        this.onError(data.message);
                    }
                }
                throw new ApiError(data.message, data);
            }
        }
    }

    private async handleHttpError(status: number, body: unknown, config?: RequestConfig): Promise<never> {
        const manual = config?.errorMessageMode === 'manual';
        const message =
            body && typeof body === 'object' && 'message' in body
                ? String((body as { message?: unknown }).message ?? '')
                : '';
        switch (status) {
            case ResultEnum.EXPIRED:
                this.onRedirect({ type: 'expired' });
                throw new ApiError(message, body as ResultData, status);
            case ResultEnum.OVERDUE:
            case ResultEnum.FORBIDDEN: {
                if (status === ResultEnum.FORBIDDEN && isCsrfForbidden(message)) {
                    throw new ApiError(message, body as ResultData, status);
                }
                if (!manual) this.onError(message || 'commons.res.forbidden');
                useGlobalStore.getState().clearAuthInfo();
                this.onRedirect({ type: 'entrance', entrance: useGlobalStore.getState().entrance });
                throw new ApiError(message, body as ResultData, status);
            }
            default:
                if (!manual) this.onError(message || `commons.res.${status}`);
                throw new ApiError(message, body as ResultData, status);
        }
    }

    async request<T>(
        method: string,
        url: string,
        body?: unknown,
        config?: RequestConfig,
    ): Promise<ResultData<T>> {
        const headers = this.buildHeaders(url, method, config);
        let response: Response;
        try {
            response = await this.fetchImpl(`${this.baseURL}${url}`, {
                method,
                credentials: 'include',
                headers: {
                    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
                    ...headers,
                },
                body: body !== undefined ? JSON.stringify(body) : undefined,
                signal: AbortSignal.timeout(config?.timeout ?? ResultEnum.TIMEOUT),
            });
        } catch (error) {
            if (config?.errorMessageMode !== 'manual') {
                const isTimeout = error instanceof DOMException && error.name === 'TimeoutError';
                this.onError(isTimeout ? 'commons.msg.requestTimeout' : String(error));
            }
            throw error;
        }

        if (!response.ok) {
            let body: unknown;
            try {
                body = await response.json();
            } catch {
                body = undefined;
            }
            return this.handleHttpError(response.status, body, config);
        }

        const data = (await response.json()) as ResultData<T>;
        return this.handleBusinessCode(data, config);
    }

    get<T>(url: string, config?: RequestConfig) {
        return this.request<T>('GET', url, undefined, config);
    }
    post<T>(url: string, body?: unknown, config?: RequestConfig) {
        return this.request<T>('POST', url, body, config);
    }
    put<T>(url: string, body?: unknown, config?: RequestConfig) {
        return this.request<T>('PUT', url, body, config);
    }
    delete<T>(url: string, config?: RequestConfig) {
        return this.request<T>('DELETE', url, undefined, config);
    }
}

export const http = new HttpClient({
    baseURL: (import.meta.env.VITE_API_URL as string) ?? '/api/v2',
});

export const setRedirectHandler = (handler?: (redirect: AuthRedirect) => void) => {
    (http as unknown as { onRedirect: (redirect: AuthRedirect) => void }).onRedirect =
        handler ?? (() => undefined);
};

export const setErrorHandler = (handler?: ErrorNotifier) => {
    (http as unknown as { onError: ErrorNotifier }).onError = handler ?? (() => undefined);
};

export const setReloadHandler = (handler?: () => void) => {
    (http as unknown as { onReload: () => void }).onReload = handler ?? (() => undefined);
};
