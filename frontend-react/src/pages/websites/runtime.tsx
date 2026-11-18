import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchRuntimes, DeleteRuntime, OperateRuntime, searchTemplates, type Runtime, type WebsiteTemplate } from '@/api/runtime';
import { ArrowLeft, Trash2, Play, Square } from 'lucide-react';

export default function RuntimePage() {
    const { t } = useTranslation();
    const [runtimes, setRuntimes] = useState<Runtime[]>([]);
    const [templates, setTemplates] = useState<WebsiteTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = () => Promise.all([
        SearchRuntimes({ page: 1, pageSize: 100 }),
        searchTemplates({ page: 1, pageSize: 100 }),
    ])
        .then(([r, tpl]) => {
            setRuntimes(r.data.items || []);
            setTemplates(tpl.data.items || []);
        })
        .catch((error) => toast.error(String(error)))
        .finally(() => setLoading(false));

    useEffect(() => { void refresh(); }, []);

    const onDelete = async (id: number) => {
        if (!window.confirm(t('commons.confirmDelete', '确定删除？'))) return;
        try {
            await DeleteRuntime({ id, forceDelete: false });
            setRuntimes((prev) => prev.filter((r) => r.id !== id));
            toast.success(t('commons.msg.deleteSuccess', '删除成功'));
        } catch (error) { toast.error(String(error)); }
    };

    const onOperate = async (id: number, operate: string) => {
        try {
            await OperateRuntime({ id, operate });
            toast.success(t('commons.msg.success', '操作成功'));
            await refresh();
        } catch (error) { toast.error(String(error)); }
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-2">
                <Link to="/websites"><Button variant="ghost" size="sm"><ArrowLeft data-icon="inline-start" />{t('commons.back', '返回')}</Button></Link>
                <h1 className="text-2xl font-bold">{t('menu.runtime', '运行环境')}</h1>
            </div>
            <Card>
                <CardHeader><CardTitle>{t('runtime.list', '运行环境列表')}</CardTitle></CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-64 w-full" /> : (
                        <Table>
                            <TableHeader><TableRow><TableHead>{t('runtime.name', '名称')}</TableHead><TableHead>{t('runtime.type', '类型')}</TableHead><TableHead>{t('runtime.version', '版本')}</TableHead><TableHead>{t('runtime.status', '状态')}</TableHead><TableHead>{t('commons.action', '操作')}</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {runtimes.map((runtime) => (
                                    <TableRow key={runtime.id}>
                                        <TableCell>{runtime.name}</TableCell>
                                        <TableCell>{runtime.type}</TableCell>
                                        <TableCell>{runtime.version}</TableCell>
                                        <TableCell><Badge variant={runtime.status === 'Running' ? 'default' : 'secondary'}>{runtime.status}</Badge></TableCell>
                                        <TableCell><div className="flex gap-1">
                                            {runtime.status === 'Running' ? <Button size="sm" variant="ghost" onClick={() => onOperate(runtime.id, 'stop')}><Square /></Button> : <Button size="sm" variant="ghost" onClick={() => onOperate(runtime.id, 'start')}><Play /></Button>}
                                            <Button size="sm" variant="ghost" onClick={() => onDelete(runtime.id)}><Trash2 /></Button>
                                        </div></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>{t('menu.template', '网站模板')}</CardTitle></CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-32 w-full" /> : templates.length === 0 ? <p className="text-muted-foreground">{t('commons.noData', '暂无数据')}</p> : (
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {templates.map((tpl) => <div key={tpl.id} className="rounded border p-3"><div className="font-medium">{tpl.name}</div><div className="text-muted-foreground text-sm">{tpl.description}</div></div>)}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
