import { http } from '@/lib/http';

export interface FileInfo {
    name: string;
    path: string;
    size: number;
    isDir: boolean;
    modTime: string;
    mode: number;
    user: string;
    group: string;
}

export interface FileListResponse {
    items: FileInfo[];
    itemTotal: number;
    path: string;
}

export const getFilesList = (params: { path: string; page: number; pageSize: number; search?: string }) =>
    http.post<FileListResponse>('/files/search', { ...params, expand: true, showHidden: true });

export const createFile = (form: { path: string; isDir: boolean; name?: string }) => http.post('/files', form);

export const deleteFile = (form: { path: string; isDir: boolean; forceDelete: boolean }) => http.post('/files/del', form);

export const getFileContent = (path: string) => http.post<{ content: string }>('/files/content', { path, expand: true, page: 1, pageSize: 1 });
export const updateFileContent = (path: string, content: string) => http.post('/files/save', { path, content });

export const downloadFileUrl = (path: string) =>
    `${import.meta.env.VITE_API_URL || '/api/v2'}/files/download?path=${encodeURIComponent(path)}`;
