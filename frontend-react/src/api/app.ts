import { http } from '@/lib/http';

export interface AppItem {
    id: number;
    name: string;
    key: string;
    icon?: string;
    description: string;
    status: string;
    installed: boolean;
    versions: string[];
    tags: { key: string; name: string }[];
    shortDescZh: string;
    shortDescEn: string;
}

export interface AppResPage {
    total: number;
    items: AppItem[];
}

export interface AppReq {
    page: number;
    pageSize: number;
    name?: string;
    tags?: string[];
    type?: string;
    recommend?: boolean;
}

export interface AppDetail {
    id: number;
    appId: number;
    icon: string;
    version: string;
    readme: string;
    params: { formFields: AppFormField[] };
    dockerCompose: string;
    image: string;
    memoryRequired: number;
    architectures: string;
}

export interface AppFormField {
    type: string;
    labelZh: string;
    labelEn: string;
    required: boolean;
    default: unknown;
    envKey: string;
    key?: string;
    values?: { label: string; value: string }[];
    label?: Record<string, string>;
    description?: Record<string, string>;
}

export interface AppInstall {
    appDetailId: number;
    params: Record<string, unknown>;
    taskID: string;
    name: string;
}

export const searchApp = (req: AppReq) => http.post<AppResPage>('/apps/search', req);
export const getAppByKey = (key: string) => http.get<AppItem>(`/apps/${key}`);
export const getAppDetail = (appID: number, version: string, type: string) =>
    http.get<AppDetail>(`/apps/detail/${appID}/${version}/${type}`);
export const getAppTags = () => http.get<{ key: string; name: string }[]>('/apps/tags');
export const installApp = (install: unknown) => http.post('/apps/install', install);
export const installedOp = (op: { installId: number; operate: string; taskID?: string }) =>
    http.post('/apps/installed/op', op);

export const getAppIconUrl = (appKey: string, icon = '') =>
    /^https?:\/\//i.test(icon) ? icon : `${import.meta.env.VITE_API_URL || '/api/v2'}/apps/icon/${encodeURIComponent(appKey)}`;

export interface AppInstalled {
    id: number;
    name: string;
    appID: number;
    appDetailID: number;
    version: string;
    status: string;
    httpPort: number;
    httpsPort: number;
    path: string;
    appKey: string;
    icon: string;
    createdAt: string;
}

export const searchAppInstalled = (search: { page: number; pageSize: number; name?: string }) =>
    http.post<{ total: number; items: AppInstalled[] }>('/apps/installed/search', search);
