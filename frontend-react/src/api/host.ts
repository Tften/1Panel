import { http } from '@/lib/http';

export const loadMonitor = (params: { type: string; startTime: string; endTime: string }) =>
    http.post<Array<{ time: string; cpu: number; memory: number; disk: number; network: number }>>('/hosts/monitor/search', params);
