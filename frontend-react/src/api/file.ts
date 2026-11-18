import { http } from '@/lib/http';

export interface FileInfo {
    name: string;
    path: string;
    size: number;
    isDir: boolean;
    modTime: string;
    mode: string;
    user: string;
    group: string;
}

export const getFilesList = (params: { path: string; page: number; pageSize: number; search?: string }) =>
    http.post<{ items: FileInfo[]; total: number }>('files/search', params);

export const createFile = (form: { path: string; name: string; isDir: boolean; content?: string }) =>
    http.post('files', form);

export const deleteFile = (params: { paths: string[] }) => http.post('files/del', params);

export const downloadFile = (path: string) => http.post('files/download', { path });
