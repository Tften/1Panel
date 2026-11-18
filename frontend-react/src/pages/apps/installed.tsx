import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { searchAppInstalled, type AppInstalled } from '@/api/app';
import { ArrowLeft } from 'lucide-react';

export default function AppInstalledPage() {
    const { t } = useTranslation();
    const [apps, setApps] = useState<AppInstalled[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        searchAppInstalled({ page: 1, pageSize: 100 })
            .then((res) => setApps(res.data.items))
            .catch(() => undefined)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-2">
                <Link to="/apps">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-1 size-4" />
                        {t('commons.back', '返回')}
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">{t('app.installed', '已安装应用')}</h1>
            </div>

            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {apps.map((app) => (
                        <Card key={app.id}>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>{app.name}</span>
                                    <Badge variant={app.status === 'Running' ? 'default' : 'secondary'}>
                                        {app.status}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('app.version', '版本')}</span>
                                    <span>{app.version}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('app.port', '端口')}</span>
                                    <span>
                                        {app.httpPort || '-'} / {app.httpsPort || '-'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{t('app.path', '路径')}</span>
                                    <span className="max-w-[200px] truncate font-mono text-xs">{app.path}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
