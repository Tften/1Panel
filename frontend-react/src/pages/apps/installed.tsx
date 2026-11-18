import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { searchAppInstalled, installedOp, getAppIconUrl, type AppInstalled } from '@/api/app';
import { ArrowLeft, Play, RotateCw, Square } from 'lucide-react';

export default function AppInstalledPage() {
    const { t } = useTranslation();
    const [apps, setApps] = useState<AppInstalled[]>([]);
    const [loading, setLoading] = useState(true);
    const [operating, setOperating] = useState<number | null>(null);

    useEffect(() => {
        searchAppInstalled({ page: 1, pageSize: 100 })
            .then((res) => setApps(res.data.items || []))
            .catch((error) => toast.error(String(error)))
            .finally(() => setLoading(false));
    }, []);

    const onOperate = async (app: AppInstalled, operate: string) => {
        setOperating(app.id);
        try {
            await installedOp({ installId: app.id, operate, taskID: crypto.randomUUID() });
            toast.success(t('commons.msg.success', '操作成功'));
            const res = await searchAppInstalled({ page: 1, pageSize: 100 });
            setApps(res.data.items || []);
        } catch (error) {
            toast.error(String(error));
        } finally {
            setOperating(null);
        }
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-2">
                <Link to="/apps"><Button variant="ghost" size="sm"><ArrowLeft data-icon="inline-start" />{t('commons.back', '返回')}</Button></Link>
                <h1 className="text-2xl font-bold">{t('app.installed', '已安装应用')}</h1>
            </div>
            {loading ? <Skeleton className="h-64 w-full" /> : apps.length === 0 ? <p className="text-muted-foreground">{t('commons.noData', '暂无数据')}</p> : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {apps.map((app) => (
                        <Card key={app.id}>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2"><img src={getAppIconUrl(app.appKey, app.icon)} alt="" className="size-8 rounded" />{app.name}</span>
                                    <Badge variant={app.status === 'Running' ? 'default' : 'secondary'}>{app.status}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-3 text-sm">
                                <div className="flex justify-between"><span className="text-muted-foreground">{t('app.version', '版本')}</span><span>{app.version}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">{t('app.port', '端口')}</span><span>{app.httpPort || '-'} / {app.httpsPort || '-'}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">{t('app.path', '路径')}</span><span className="max-w-[200px] truncate font-mono text-xs">{app.path}</span></div>
                                <div className="flex gap-2">
                                    {app.status === 'Running' ? <Button size="sm" variant="outline" disabled={operating === app.id} onClick={() => onOperate(app, 'stop')}><Square data-icon="inline-start" />{t('commons.button.stop', '停止')}</Button> : <Button size="sm" variant="outline" disabled={operating === app.id} onClick={() => onOperate(app, 'start')}><Play data-icon="inline-start" />{t('commons.button.start', '启动')}</Button>}
                                    <Button size="sm" variant="outline" disabled={operating === app.id} onClick={() => onOperate(app, 'restart')}><RotateCw data-icon="inline-start" />{t('commons.button.restart', '重启')}</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
