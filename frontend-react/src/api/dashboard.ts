import { http } from '@/lib/http';

export interface BaseInfo {
    hostname: string;
    os: string;
    platform: string;
    platformVersion: string;
    prettyDistro: string;
    kernelArch: string;
    kernelVersion: string;
    virtualizationSystem: string;
    ipV4Addr: string;
    cpuCores: number;
    cpuLogicalCores: number;
    cpuModelName: string;
    cpuMhz: number;
    currentInfo: CurrentInfo;
}

export interface CurrentInfo {
    uptime: number;
    timeSinceUptime: string;
    runningTime: { days: number; hours: number; minutes: number; seconds: number };
    procs: number;
    load1: number;
    load5: number;
    load15: number;
    loadUsagePercent: number;
    cpuPercent: number[];
    cpuUsedPercent: number;
    cpuUsed: number;
    cpuTotal: number;
    memoryTotal: number;
    memoryAvailable: number;
    memoryUsed: number;
    memoryUsedPercent: number;
    swapMemoryTotal: number;
    swapMemoryUsed: number;
    swapMemoryUsedPercent: number;
    ioReadBytes: number;
    ioWriteBytes: number;
    diskData: DiskInfo[];
    netBytesSent: number;
    netBytesRecv: number;
    shotTime: string;
}

export interface DiskInfo {
    path: string;
    total: number;
    free: number;
    used: number;
    usedPercent: number;
    inodesTotal: number;
    inodesUsed: number;
    inodesFree: number;
    inodesUsedPercent: number;
}

export const loadBaseInfo = (ioOption: string, netOption: string) =>
    http.get<BaseInfo>(`/dashboard/base/${ioOption}/${netOption}`);

export const loadCurrentInfo = (ioOption: string, netOption: string) =>
    http.get<CurrentInfo>(`/dashboard/current/${ioOption}/${netOption}`);
