import { http } from '@/lib/http';

export const getSystemFiles = () => http.get<string[]>('/logs/system/files');
