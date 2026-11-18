import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { loadMonitor } from '@/api/host';

interface MonitorData {
    time: string;
    cpu: number;
    memory: number;
    disk: number;
    network: number;
}

export default function MonitorPage() {
    const { t } = useTranslation();
    const [data, setData] = useState<MonitorData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMonitor({ type: 'host', startTime: '', endTime: '' })
            .then((res) => setData(res.data))
            .catch((error) => toast.error(String(error)))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="flex flex-col gap-4 p-6">
            <h1 className="text-2xl font-bold">{t('menu.monitor', '监控')}</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">CPU</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{data[0]?.cpu?.toFixed(1) || 0}%</div>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">{t('home.memory', '内存')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{data[0]?.memory?.toFixed(1) || 0}%</div>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">{t('home.disk', '磁盘')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{data[0]?.disk?.toFixed(1) || 0}%</div>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm">{t('home.network', '网络')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{data[0]?.network?.toFixed(1) || 0}%</div>}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
