import { http } from '@/lib/http';

export interface WebsiteRes {
    id: number;
    primaryDomain: string;
    type: string;
    alias: string;
    remark: string;
    status: string;
    expireDate: string;
    sitePath: string;
    appName: string;
    runtimeName: string;
    sslExpireDate: string;
    protocol: string;
    createdAt: string;
}

export interface WebSiteSearch {
    page: number;
    pageSize: number;
    name?: string;
    orderBy?: string;
    order?: string;
    websiteGroupId?: number;
}

export const searchWebsites = (req: WebSiteSearch) =>
    http.post<{ total: number; items: WebsiteRes[] }>('/websites/search', req);

export const preCheck = () => http.post<unknown[]>('/websites/check', {});

export interface WebSiteCreateReq {
    primaryDomain: string;
    type: string;
    alias: string;
    remark: string;
    appType: string;
    appInstallId: number;
    webSiteGroupId: number;
    otherDomains: string;
    proxy: string;
    runtimeID?: number;
    IPV6: boolean;
    enableFtp: boolean;
    ftpUser: string;
    ftpPassword: string;
    proxyType: string;
    port: number;
    runtimeType: string;
    taskID: string;
    createDb: boolean;
    enableSSL: boolean;
    domains: { domain: string; port: number; ssl: boolean }[];
    name: string;
    algorithm: string;
    servers: unknown[];
}

export const createWebsite = (req: WebSiteCreateReq) => http.post('/websites', req);
export const deleteWebsite = (req: { id: number; deleteApp: boolean; deleteBackup: boolean; forceDelete: boolean }) =>
    http.post('/websites/del', req);
export const opWebsite = (req: { id: number; operate: string }) => http.post('/websites/operate', req);

export interface SSL {
    id: number;
    primaryDomain: string;
    privateKey: string;
    certificate: string;
    expireDate: string;
    type: string;
    organization: string;
    status: string;
}

export const searchSSL = (req: { page: number; pageSize: number; name?: string }) =>
    http.post<{ total: number; items: SSL[] }>('/websites/ssl/search', req);

export const deleteSSL = (id: number) => http.post('/websites/ssl/del', { id });
