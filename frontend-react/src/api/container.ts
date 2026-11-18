import { http } from '@/lib/http';

export interface ContainerInfo {
    containerID: string;
    name: string;
    imageName: string;
    createTime: string;
    state: string;
    runTime: string;
    ports: string[];
    cpuPercent: number;
    memoryPercent: number;
}

export interface ContainerSearch {
    page: number;
    pageSize: number;
    name?: string;
    state?: string;
}

export const searchContainer = (params: ContainerSearch) =>
    http.post<{ total: number; items: ContainerInfo[] }>('/containers/search', params);

export const containerOperate = (params: { names: string[]; operation: string }) =>
    http.post('/containers/operate', params);

export const loadContainerStatus = () =>
    http.get<{ containerCount: number; running: number; exited: number; paused: number }>('/containers/status');
