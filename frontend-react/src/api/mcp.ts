import { http } from '@/lib/http';

const prefix = '/core/mcp';
const local = { headers: { CurrentNode: 'local' } };

export interface ServiceStatus {
    runtimeType: string;
    dockerImage: string;
    containerName: string;
    enabled: boolean;
    installed: boolean;
    status: string;
    ready: boolean;
    reason: string;
    adapterVersion: string;
    endpoint: string;
    canManageService: boolean;
    installing: boolean;
}

export interface Settings {
    runtimeType: string;
    dockerImage: string;
    enabled: boolean;
    listenPort: number;
    externalUrl: string;
    revision: number;
    accessPolicy: string;
    allowedIPs: string[];
}

export interface Credential {
    id: string;
    name: string;
    description: string;
    keyHint: string;
    status: string;
    revision: number;
    createdAt: string;
    ownerName: string;
}

export const getPanelMCPStatus = () => http.get<ServiceStatus>(`${prefix}/status`, {}, local);
export const getPanelMCPSettings = () => http.get<Settings>(`${prefix}/settings`, {}, local);
export const savePanelMCPSettings = (params: Settings) => http.post(`${prefix}/settings`, params, local);
export const operatePanelMCPService = (operation: string) => http.post(`${prefix}/service/operate`, { operation }, local);
export const searchPanelMCPCredentials = (params: { page: number; pageSize: number }) =>
    http.post<{ total: number; items: Credential[] }>(`${prefix}/credentials/search`, params, local);
export const deletePanelMCPCredential = (params: { id: string; revision: number }) =>
    http.post(`${prefix}/credentials/delete`, params, local);
