import { http } from '@/lib/http';

export interface FirewallRule {
    rule: {
        protocol: string;
        sourceAddress?: string;
        destinationAddress?: string;
        destinationPort?: string;
        action: string;
        description?: string;
    };
    isWhitelist: boolean;
}

export const searchFirewallRules = (params: { page: number; pageSize: number; info: string; scopes: unknown[] }) =>
    http.post<{ total: number; items: FirewallRule[] }>('/hosts/firewall/rules/search', params);

export interface SSHInfo {
    port: string;
    listenAddress: string;
    passwordAuthentication: string;
    pubkeyAuthentication: string;
    permitRootLogin: string;
}

export const getSSHInfo = () => http.post<SSHInfo>('/hosts/ssh/search', {});

export interface DiskInfo {
    name: string;
    size: string;
    type: string;
    mountpoint: string;
    fstype: string;
}

export const getDiskInfo = () => http.get<{ disks: DiskInfo[] }>('/hosts/disks');

export interface ProcessInfo {
    pid: number;
    name: string;
    user: string;
    cpu: number;
    memory: number;
    status: string;
}

export const getListeningProcess = () => http.post<ProcessInfo[]>('/process/listening', {});
