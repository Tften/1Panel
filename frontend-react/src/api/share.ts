import { http } from '@/lib/http';

export const getPublicFileShareInfo = (code: string) =>
    http.get<{ fileName: string; expiresAt: number; permanent: boolean; hasPassword: boolean }>('files/share/info', { params: { code, operateNode: 'local' } });

export const checkFileShare = (params: { code: string; password: string }) =>
    http.get('files/share/check', { params });
