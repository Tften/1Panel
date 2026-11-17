export const ResultEnum = {
    SUCCESS: 200,
    ERR_IP: 310,
    ERR_DOMAIN: 311,
    UNSAFETY: 312,
    EXPIRED: 313,
    ERROR: 500,
    OVERDUE: 401,
    FORBIDDEN: 403,
    NOTFOUND: 404,
    ERR_AUTH: 406,
    ERR_GLOBAL_LOADING: 407,
    ERR_XPACK: 410,
    NODE_UNBIND: 411,
    ERR_RBAC: 412,
    ERR_ENTERPRISE: 413,
    TIMEOUT: 20000,
} as const;

export const DEFAULT_LOCALE = 'en';
export const LOCALE_STORAGE_KEY = 'lang';

export const LOGIN_ENDPOINTS = new Set([
    '/core/auth/login',
    '/core/auth/mfalogin',
    '/core/auth/passkey/begin',
    '/core/auth/passkey/finish',
    '/core/auth/oidc/begin',
    '/core/auth/oidc/finish',
    '/core/auth/saml2/begin',
    '/core/auth/saml2/finish',
]);
