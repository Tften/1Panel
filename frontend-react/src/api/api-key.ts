import { http } from '@/lib/http';

const prefix = '/core/auth/api/keys';

export interface APIKey {
    id: string;
    name: string;
    description: string;
    keyHint: string;
    status: string;
    revision: number;
    createdAt: string;
}

export const searchAPIKeys = (params: { page: number; pageSize: number; excludeRevoked?: boolean }) =>
    http.post<{ items: APIKey[]; total: number }>(`${prefix}/search`, params);

export const deleteAPIKey = (params: { id: string; revision: number }) =>
    http.post(`${prefix}/delete`, params);

export const revokeAPIKey = (params: { id: string; revision: number }) =>
    http.post(`${prefix}/revoke`, params);
