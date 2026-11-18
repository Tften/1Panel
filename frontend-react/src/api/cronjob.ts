import { http } from '@/lib/http';

export interface CronjobInfo {
    id: number;
    name: string;
    type: string;
    spec: string;
    status: string;
    lastTime: string;
    nextTime: string;
    command: string;
}

export const searchCronjobPage = (params: { page: number; pageSize: number; name?: string }) =>
    http.post<{ total: number; items: CronjobInfo[] }>('/cronjobs/search', params);

export const deleteCronjob = (id: number) => http.post('/cronjobs/del', { id });
export const editCronjob = (params: unknown) => http.post('/cronjobs/edit', params);
export const addCronjob = (params: {
    name: string;
    type: string;
    spec: string;
    command: string;
    executor: string;
    scriptMode: string;
    user: string;
    retainCopies: number;
    retryTimes: number;
    timeout: number;
}) => http.post('/cronjobs', params);
