import { http } from '@/lib/http';

export interface BackupAccount {
    id: number;
    name: string;
    type: string;
    isPublic: boolean;
    accessKey: string;
    bucket: string;
    backupPath: string;
    createdAt: string;
}

export const searchBackupAccounts = (params: { page: number; pageSize: number; type?: string }) =>
    http.post<{ total: number; items: BackupAccount[] }>('/backups/search', params);

export const deleteBackupAccount = (params: { id: number; name: string; isPublic: boolean }) =>
    params.isPublic ? http.post('/core/backups/del', { name: params.name }) : http.post('/backups/del', { id: params.id });
