import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { pageAgents, deleteAgent, loadGPUInfo, type AgentItem, type GPUDevice } from '@/api/ai';
import { ArrowLeft, Trash2 } from 'lucide-react';

export default function AgentsPage() {
    const { t } = useTranslation();
    const [agents, setAgents] = useState<AgentItem[]>([]);
    const [gpus, setGpus] = useState<GPUDevice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            pageAgents({ page: 1, pageSize: 100 }),
            loadGPUInfo().catch(() => ({ data: { gpu: [] } })),
        ])
            .then(([a, g]) => {
                setAgents(a.data.items || []);
                setGpus(g.data.gpu || []);
            })
            .catch((error) => toast.error(String(error)))
            .finally(() => setLoading(false));
    }, []);

    const onDelete = async (id: number) => {
        if (!window.confirm(t('commons.confirmDelete', '确定删除？'))) return;
        try {
            await deleteAgent({ id, taskID: crypto.randomUUID(), forceDelete: false });
            setAgents((prev) => prev.filter((a) => a.id !== id));
            toast.success(t('commons.msg.deleteSuccess', '删除成功'));
        } catch (error) { toast.error(String(error)); }
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-2">
                <Link to="/ai/ollama"><Button variant="ghost" size="sm"><ArrowLeft data-icon="inline-start" />{t('commons.back', '返回')}</Button></Link>
                <h1 className="text-2xl font-bold">{t('aiTools.agents.agent', 'AI 代理')}</h1>
            </div>
            <Card>
                <CardHeader><CardTitle>{t('aiTools.agents.list', '代理列表')}</CardTitle></CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-64 w-full" /> : (
                        <Table>
                            <TableHeader><TableRow><TableHead>{t('aiTools.name', '名称')}</TableHead><TableHead>{t('aiTools.provider', '提供商')}</TableHead><TableHead>{t('aiTools.model', '模型')}</TableHead><TableHead>{t('aiTools.status', '状态')}</TableHead><TableHead>{t('commons.action', '操作')}</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {agents.map((agent) => (
                                    <TableRow key={agent.id}>
                                        <TableCell>{agent.name}</TableCell>
                                        <TableCell>{agent.providerName}</TableCell>
                                        <TableCell>{agent.model}</TableCell>
                                        <TableCell><Badge variant={agent.status === 'Running' ? 'default' : 'secondary'}>{agent.status}</Badge></TableCell>
                                        <TableCell><Button size="sm" variant="ghost" onClick={() => onDelete(agent.id)}><Trash2 /></Button></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>GPU</CardTitle></CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-32 w-full" /> : gpus.length === 0 ? <p className="text-muted-foreground">{t('commons.noData', '暂无数据')}</p> : (
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {gpus.map((gpu, i) => <div key={i} className="rounded border p-3"><div className="font-medium">{gpu.name}</div><div className="text-sm">利用率 {gpu.utilization}% · 显存 {gpu.memoryUsed}/{gpu.memoryTotal} MB · 温度 {gpu.temperature}°C</div></div>)}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
