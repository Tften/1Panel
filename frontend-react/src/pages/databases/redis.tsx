import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { loadRedisStatus, type RedisStatus } from '@/api/database';

export default function RedisPage() {
    const { t } = useTranslation();
    const [status, setStatus] = useState<RedisStatus | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRedisStatus('redis', 'local')
            .then((res) => setStatus(res.data))
            .catch((error) => toast.error(String(error)))
            .finally(() => setLoading(false));
    }, []);

    const items = status ? [
        { label: t('database.port', '端口'), value: status.tcp_port },
        { label: t('database.uptime', '运行天数'), value: status.uptime_in_days },
        { label: t('database.clients', '客户端连接'), value: status.connected_clients },
        { label: t('database.memory', '已用内存'), value: status.used_memory },
        { label: t('database.memoryRss', 'RSS 内存'), value: status.used_memory_rss },
        { label: t('database.memoryPeak', '峰值内存'), value: status.used_memory_peak },
        { label: t('database.connections', '总连接数'), value: status.total_connections_received },
        { label: t('database.commands', '总命令数'), value: status.total_commands_processed },
        { label: t('database.ops', '每秒操作'), value: status.instantaneous_ops_per_sec },
    ] : [];

    return (
        <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Redis</h1><Link to="/databases/mysql"><Button variant="outline">MySQL</Button></Link></div>
            <Card>
                <CardHeader><CardTitle>{t('database.status', '状态')}</CardTitle><CardDescription>{t('database.statusHelper', '当前 Redis 实例的运行状态')}</CardDescription></CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-32 w-full" /> : (
                        <div className="grid gap-3 md:grid-cols-3">
                            {items.map((item) => <div key={item.label} className="flex justify-between rounded border p-3 text-sm"><span className="text-muted-foreground">{item.label}</span><span className="font-mono">{item.value || '-'}</span></div>)}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
