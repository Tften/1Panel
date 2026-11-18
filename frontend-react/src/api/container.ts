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

export interface ImageInfo {
    id: string;
    name: string;
    tags: string[];
    size: string;
    isUsed: boolean;
    createdAt: string;
}

export const searchImage = (params: { page: number; pageSize: number; name?: string }) =>
    http.post<{ total: number; items: ImageInfo[] }>('/containers/image/search', params);

export const deleteImage = (params: { names: string[]; taskID: string }) => http.post('/containers/image/remove', params);

export interface NetworkInfo {
    id: string;
    name: string;
    driver: string;
    subnet: string;
    gateway: string;
    createdAt: string;
}

export const searchNetwork = (params: { page: number; pageSize: number; name?: string }) =>
    http.post<{ total: number; items: NetworkInfo[] }>('/containers/network/search', params);

export const deleteNetwork = (params: { names: string[]; taskID: string }) => http.post('/containers/network/del', params);

export interface VolumeInfo {
    name: string;
    driver: string;
    mountpoint: string;
    createdAt: string;
}

export const searchVolume = (params: { page: number; pageSize: number; name?: string }) =>
    http.post<{ total: number; items: VolumeInfo[] }>('/containers/volume/search', params);

export const deleteVolume = (params: { names: string[]; taskID: string }) => http.post('/containers/volume/del', params);

export interface ComposeInfo {
    name: string;
    createdAt: string;
    containerCount: number;
    runningCount: number;
    workdir: string;
}

export const searchCompose = (params: { page: number; pageSize: number; name?: string }) =>
    http.post<{ total: number; items: ComposeInfo[] }>('/containers/compose/search', params);

export const deleteCompose = (params: { name: string; operation: string; path: string; withFile: boolean; force: boolean }) =>
    http.post('/containers/compose/operate', params);
