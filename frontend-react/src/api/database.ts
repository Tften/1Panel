import { http } from '@/lib/http';

export interface MysqlDBInfo {
    id: number;
    name: string;
    mysqlName: string;
    from: string;
    format: string;
    username: string;
    permission: string;
    description: string;
    createdAt: string;
}

export interface PostgresqlDBInfo {
    id: number;
    name: string;
    pgName: string;
    from: string;
    format: string;
    username: string;
    permission: string;
    description: string;
    createdAt: string;
}

export interface SearchDBWithPage {
    info: string;
    database: string;
    page: number;
    pageSize: number;
    orderBy?: string;
    order?: string;
}

export const searchMysqlDBs = (params: SearchDBWithPage) =>
    http.post<{ total: number; items: MysqlDBInfo[] }>('/databases/search', params);

export const searchPostgresqlDBs = (params: SearchDBWithPage) =>
    http.post<{ total: number; items: PostgresqlDBInfo[] }>('/databases/pg/search', params);

export const deleteMysqlDB = (params: { id: number; forceDelete: boolean }) =>
    http.post('/databases/del', params);

export const deletePostgresqlDB = (params: { id: number; forceDelete: boolean }) =>
    http.post('/databases/pg/del', params);

export const loadDBBaseInfo = (type: string, database: string) =>
    http.post<{ name: string; port: number; containerName: string }>('/databases/common/info', { type, name: database });
