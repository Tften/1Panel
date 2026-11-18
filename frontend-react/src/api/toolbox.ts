import { http } from '@/lib/http';

export const getSystemFiles = () => http.get<string[]>('/logs/system/files');

export interface Fail2banBaseInfo {
    isActive: boolean;
    isExist: boolean;
    version: string;
}

export const getFail2banBaseInfo = () => http.get<Fail2banBaseInfo>('/toolbox/fail2ban/base');
export const operateFail2ban = (operation: string) => http.post('/toolbox/fail2ban/operate', { operation });

export interface FtpInfo {
    id: number;
    user: string;
    path: string;
    status: string;
}

export const searchFtp = (params: { page: number; pageSize: number }) =>
    http.post<{ total: number; items: FtpInfo[] }>('/toolbox/ftp/search', params);

export const deleteFtp = (id: number) => http.post('/toolbox/ftp/del', { id });

export interface SupervisorProcess {
    name: string;
    status: string;
    numprocs: number;
}

export const getSupervisorProcesses = () => http.get<SupervisorProcess[]>('/hosts/tool/supervisor/process');
