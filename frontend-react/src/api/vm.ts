import { http } from '@/lib/http';

export interface VMInfo {
    id: number;
    name: string;
    status: string;
    cpu: number;
    memory: number;
}

export const searchVM = (params: { page: number; pageSize: number; name?: string }) =>
    http.post<{ total: number; items: VMInfo[] }>('/vms/search', params);

export const deleteVM = (id: number) => http.post('/vms/del', { id });
