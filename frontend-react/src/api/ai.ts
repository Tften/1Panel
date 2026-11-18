import { http } from '@/lib/http';

export interface OllamaModel {
    id: number;
    name: string;
    size: string;
    status: string;
    createdAt: string;
}

export const searchOllamaModel = (params: { page: number; pageSize: number; name?: string }) =>
    http.post<{ total: number; items: OllamaModel[] }>('/ai/ollama/model/search', params);

export const deleteOllamaModel = (ids: number[], force: boolean) =>
    http.post('/ai/ollama/model/del', { ids, forceDelete: force });

export const loadOllamaModel = (name: string) => http.post('/ai/ollama/model/load', { name });
