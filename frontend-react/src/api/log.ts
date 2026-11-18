import { http } from '@/lib/http';

export interface OperationLog {
    id: number;
    ip: string;
    user: string;
    operation: string;
    detail: string;
    status: string;
    createdAt: string;
}

export interface LoginLog {
    id: number;
    ip: string;
    user: string;
    status: string;
    message: string;
    createdAt: string;
}

export const getOperationLogs = (info: { page: number; pageSize: number }) =>
    http.post<{ total: number; items: OperationLog[] }>('/core/logs/operation', info);

export const getLoginLogs = (info: { page: number; pageSize: number }) =>
    http.post<{ total: number; items: LoginLog[] }>('/core/logs/login', info);

export interface TaskLog {
    id: number;
    name: string;
    type: string;
    status: string;
    createdAt: string;
}

export const getTaskLogs = (params: { page: number; pageSize: number }) =>
    http.post<{ total: number; items: TaskLog[] }>('/logs/tasks/search', params);

export const readSystemLogs = (params: { page: number; pageSize: number; name?: string }) =>
    http.post<{ total: number; items: string[] }>('/logs/system/read', params);
