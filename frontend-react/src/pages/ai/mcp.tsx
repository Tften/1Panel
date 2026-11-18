import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { getPanelMCPStatus, operatePanelMCPService, searchPanelMCPCredentials, deletePanelMCPCredential, type ServiceStatus, type Credential } from '@/api/mcp';
import { Play, Square, Trash2 } from 'lucide-react';

export default function MCPPage() {
    const { t } = useTranslation();
    const [status, setStatus] = useState<ServiceStatus | null>(null);
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = () => Promise.all([getPanelMCPStatus(), searchPanelMCPCredentials({ page: 1, pageSize: 100 })])
        .then(([s, c]) => {
            setStatus(s.data);
            setCredentials(c.data.items || []);
        })
        .catch((error) => toast.error(String(error)))
        .finally(() => setLoading(false));

    useEffect(() => { void refresh(); }, []);

    const onOperate = async (operation: string) => {
        try {
            await operatePanelMCPService(operation);
            toast.success(t('commons.msg.success', '操作成功'));
            await refresh();
        } catch (error) { toast.error(String(error)); }
    };

    const onDelete = async (credential: Credential) => {
        if (!window.confirm(t('commons.confirmDelete', '确定删除？'))) return;
        try {
            await deletePanelMCPCredential({ id: credential.id, revision: credential.revision });
            setCredentials((prev) => prev.filter((item) => item.id !== credential.id));
            toast.success(t('commons.msg.deleteSuccess', '删除成功'));
        } catch (error) { toast.error(String(error)); }
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <h1 className="text-2xl font-bold">{t('menu.mcp', 'MCP 管理')}</h1>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>{t('mcp.service', '服务状态')}</span>
                        {status && <Badge variant={status.ready ? 'default' : 'secondary'}>{status.status}</Badge>}
                    </CardTitle>
                    <CardDescription>{status?.reason || status?.containerName}</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                    {loading ? <Skeleton className="h-8 w-32" /> : status?.ready ? (
                        <Button variant="outline" onClick={() => onOperate('stop')}><Square data-icon="inline-start" />{t('commons.button.stop', '停止')}</Button>
                    ) : (
                        <Button onClick={() => onOperate('start')}><Play data-icon="inline-start" />{t('commons.button.start', '启动')}</Button>
                    )}
                    {status?.endpoint && <code className="bg-muted rounded px-2 py-1 text-xs">{status.endpoint}</code>}
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>{t('mcp.credentials', '访问凭证')}</CardTitle></CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-32 w-full" /> : (
                        <Table>
                            <TableHeader><TableRow><TableHead>{t('mcp.name', '名称')}</TableHead><TableHead>{t('mcp.keyHint', '密钥')}</TableHead><TableHead>{t('mcp.status', '状态')}</TableHead><TableHead>{t('mcp.owner', '所有者')}</TableHead><TableHead>{t('commons.action', '操作')}</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {credentials.map((credential) => (
                                    <TableRow key={credential.id}>
                                        <TableCell>{credential.name}</TableCell>
                                        <TableCell className="font-mono">{credential.keyHint}</TableCell>
                                        <TableCell><Badge variant={credential.status === 'Enable' ? 'default' : 'secondary'}>{credential.status}</Badge></TableCell>
                                        <TableCell>{credential.ownerName}</TableCell>
                                        <TableCell><Button size="sm" variant="ghost" onClick={() => onDelete(credential)}><Trash2 /></Button></TableCell>
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
