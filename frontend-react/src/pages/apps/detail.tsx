import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getAppByKey } from '@/api/app';
import type { AppItem } from '@/api/app';
import { ArrowLeft, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AppDetailPage() {
    const { t } = useTranslation();
    const { key } = useParams();
    const [app, setApp] = useState<AppItem | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!key) return;
        getAppByKey(key)
            .then((res) => setApp(res.data))
            .catch(() => undefined)
            .finally(() => setLoading(false));
    }, [key]);

    if (loading) {
        return <Skeleton className="h-64 w-full" />;
    }

    if (!app) {
        return <div className="p-6">{t('commons.notFound', '未找到应用')}</div>;
    }

    return (
        <div className="flex flex-col gap-4 p-6">
            <Link to="/apps">
                <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-1 size-4" />
                    {t('commons.back', '返回')}
                </Button>
            </Link>
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    {app.icon && <img src={app.icon} alt={app.name} className="size-16 rounded" />}
                    <div>
                        <CardTitle>{app.name}</CardTitle>
                        <CardDescription>{app.shortDescZh || app.shortDescEn}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: app.description }} />
                    <div className="flex gap-2">
                        <Button>
                            <Download className="mr-1 size-4" />
                            {t('app.install', '安装')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
