import { http } from '@/lib/http';

export interface AppItem {
    id: number;
    name: string;
    key: string;
    icon?: string;
    description: string;
    status: string;
    installed: boolean;
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
    params: { formFields: unknown[] };
    dockerCompose: string;
    image: string;
    memoryRequired: number;
    architectures: string;
}

export const searchApp = (req: AppReq) => http.post<AppResPage>('apps/search', req);
export const getAppByKey = (key: string) => http.get<AppItem>(`apps/${key}`);
export const getAppDetail = (appID: number, version: string, type: string) =>
    http.get<AppDetail>(`apps/detail/${appID}/${version}/${type}`);
export const getAppTags = () => http.get<{ key: string; name: string }[]>('apps/tags');
export const installApp = (install: unknown) => http.post('apps/install', install);

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
    createdAt: string;
}

export const searchAppInstalled = (search: { page: number; pageSize: number; name?: string }) =>
    http.post<{ total: number; items: AppInstalled[] }>('apps/installed/search', search);
