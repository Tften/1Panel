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
