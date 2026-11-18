import { http } from '@/lib/http';

export interface OllamaModel {
    id: number;
    name: string;
    size: string;
    status: string;
    createdAt: string;
}

export const searchOllamaModel = (params: { page: number; pageSize: number; name?: string }) =>
    http.post<{ total: number; items: OllamaModel[] }>('/ai/ollama/model/search', params);

export const deleteOllamaModel = (ids: number[], force: boolean) =>
    http.post('/ai/ollama/model/del', { ids, forceDelete: force });

export const loadOllamaModel = (name: string) => http.post('/ai/ollama/model/load', { name });

export interface AgentItem {
    id: number;
    name: string;
    remark: string;
    providerName: string;
    model: string;
    status: string;
    message: string;
    websitePrimaryDomain: string;
}

export const pageAgents = (req: { page: number; pageSize: number; info?: string }) =>
    http.post<{ total: number; items: AgentItem[] }>('/ai/agents/search', req);

export const deleteAgent = (req: { id: number; taskID: string; forceDelete: boolean }) =>
    http.post('/ai/agents/delete', req);

export interface GPUDevice {
    index: number;
    name: string;
    utilization: number;
    memoryUsed: number;
    memoryTotal: number;
    temperature: number;
    powerDraw: number;
}

export const loadGPUInfo = () =>
    http.get<{ cudaVersion: string; driverVersion: string; gpu: GPUDevice[]; summaries?: GPUDevice[] }>('/ai/gpu/load');

export interface McpServer {
    id: number;
    name: string;
    status: string;
    baseUrl: string;
    ssePath: string;
    port: number;
    containerName: string;
    message: string;
}

export const pageMcpServer = (req: { page: number; pageSize: number; name?: string }) =>
    http.post<{ total: number; items: McpServer[] }>('/ai/mcp/search', req);

export const deleteMcpServer = (req: { id: number }) => http.post('/ai/mcp/server/del', req);
export const operateMcpServer = (req: { id: number; operate: string }) => http.post('/ai/mcp/server/op', req);
