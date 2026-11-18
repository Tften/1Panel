import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { pageMcpServer, deleteMcpServer, operateMcpServer, type McpServer } from '@/api/ai';
import { ArrowLeft, Trash2, Play, Square } from 'lucide-react';

export default function McpServerPage() {
    const { t } = useTranslation();
    const [servers, setServers] = useState<McpServer[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = () => pageMcpServer({ page: 1, pageSize: 100 })
        .then((res) => setServers(res.data.items || []))
        .catch((error) => toast.error(String(error)))
        .finally(() => setLoading(false));

    useEffect(() => { void refresh(); }, []);

    const onDelete = async (id: number) => {
        if (!window.confirm(t('commons.confirmDelete', '确定删除？'))) return;
        try {
            await deleteMcpServer({ id });
            setServers((prev) => prev.filter((s) => s.id !== id));
            toast.success(t('commons.msg.deleteSuccess', '删除成功'));
        } catch (error) { toast.error(String(error)); }
    };

    const onOperate = async (id: number, operate: string) => {
        try {
            await operateMcpServer({ id, operate });
            toast.success(t('commons.msg.success', '操作成功'));
            await refresh();
        } catch (error) { toast.error(String(error)); }
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-2">
                <Link to="/ai/ollama"><Button variant="ghost" size="sm"><ArrowLeft data-icon="inline-start" />{t('commons.back', '返回')}</Button></Link>
                <h1 className="text-2xl font-bold">{t('menu.mcp', 'MCP 服务')}</h1>
            </div>
            <Card>
                <CardHeader><CardTitle>{t('mcp.servers', 'MCP 服务列表')}</CardTitle></CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-64 w-full" /> : (
                        <Table>
                            <TableHeader><TableRow><TableHead>{t('mcp.name', '名称')}</TableHead><TableHead>{t('mcp.url', '地址')}</TableHead><TableHead>{t('mcp.port', '端口')}</TableHead><TableHead>{t('mcp.status', '状态')}</TableHead><TableHead>{t('commons.action', '操作')}</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {servers.map((server) => (
                                    <TableRow key={server.id}>
                                        <TableCell>{server.name}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">{server.baseUrl}</TableCell>
                                        <TableCell>{server.port}</TableCell>
                                        <TableCell><Badge variant={server.status === 'Running' ? 'default' : 'secondary'}>{server.status}</Badge></TableCell>
                                        <TableCell><div className="flex gap-1">
                                            {server.status === 'Running' ? <Button size="sm" variant="ghost" onClick={() => onOperate(server.id, 'stop')}><Square /></Button> : <Button size="sm" variant="ghost" onClick={() => onOperate(server.id, 'start')}><Play /></Button>}
                                            <Button size="sm" variant="ghost" onClick={() => onDelete(server.id)}><Trash2 /></Button>
                                        </div></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
