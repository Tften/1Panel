import { http, type ResultData } from '@/lib/http';
import { encryptPassword } from '@/lib/auth';
import { useGlobalStore } from '@/store/global';

export interface ReqLoginForm {
    name: string;
    password: string;
    captcha: string;
    captchaID: string;
    authMethod: string;
    authSource: 'local' | 'ldap';
}

export interface ResLogin {
    name: string;
    role: string;
    token: string;
    mfaStatus: string;
    mfaSession: string;
}

export interface ResCaptcha {
    imagePath: string;
    captchaID: string;
    captchaLength: number;
}

export interface LoginSetting {
    isDemo: boolean;
    isIntl: boolean;
    language: string;
    panelName: string;
    theme: string;
    isEnterprise: boolean;
    needCaptcha: boolean;
    passkeySetting: boolean;
}

export interface AuthInfo {
    id: number;
    name: string;
    role: string;
    permissions: string[];
    masterOnlyPermissions?: string[];
    nodeRoles: Array<{ nodeId: number; nodeName: string; roleId: number; roleName: string }>;
}

export const loginApi = (params: ReqLoginForm): Promise<ResultData<ResLogin>> =>
    http.post<ResLogin>('/core/auth/login', {
        ...params,
        password: encryptPassword(params.password),
    });

export const logOutApi = () => http.post<{ saml2Navigation?: unknown }>('/core/auth/logout');

export const getCaptcha = () => http.get<ResCaptcha>('/core/auth/captcha');

export const getLoginSetting = () => http.get<LoginSetting>('/core/auth/setting');

export const getUserInfo = () => http.get<AuthInfo>('/core/auth/current');

export const syncAuthInfo = async (): Promise<AuthInfo> => {
    const res = await getUserInfo();
    useGlobalStore.getState().setAuthInfo({
        isAdmin: res.data.role === 'ADMIN',
        permissions: res.data.permissions || [],
        masterOnlyPermissions: res.data.masterOnlyPermissions || [],
        nodeRoles: res.data.nodeRoles || [],
    });
    return res.data;
};
