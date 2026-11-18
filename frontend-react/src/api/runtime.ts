import { http } from '@/lib/http';

export interface Runtime {
    id: number;
    name: string;
    type: string;
    version: string;
    status: string;
    port: string;
    remark: string;
}

export const SearchRuntimes = (req: { page: number; pageSize: number; name?: string; type?: string }) =>
    http.post<{ total: number; items: Runtime[] }>('/runtimes/search', req);

export const DeleteRuntime = (req: { id: number; forceDelete: boolean }) =>
    http.post('/runtimes/del', req);

export const OperateRuntime = (req: { id: number; operate: string }) =>
    http.post('/runtimes/operate', req);

export interface WebsiteTemplate {
    id: number;
    name: string;
    description: string;
    createdAt: string;
}

export const searchTemplates = (req: { page: number; pageSize: number; name?: string }) =>
    http.post<{ total: number; items: WebsiteTemplate[] }>('/websites/templates/search', req);
