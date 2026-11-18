import { http } from '@/lib/http';

export interface HostInfo {
    id: number;
    name: string;
    addr: string;
    port: number;
    user: string;
    authMode: string;
}

export const searchHosts = (params: { page: number; pageSize: number; name?: string }) =>
    http.post<{ total: number; items: HostInfo[] }>('/hosts/search', params);

export const addHost = (params: unknown) => http.post('/hosts', params);
export const deleteHost = (id: number) => http.post('/hosts/del', { id });
