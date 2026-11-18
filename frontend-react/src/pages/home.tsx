import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { loadBaseInfo, loadCurrentInfo, type BaseInfo, type CurrentInfo } from '@/api/dashboard';
import { useGlobalStore } from '@/store/global';

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export default function HomePage() {
    const { t } = useTranslation();
    const currentNode = useGlobalStore((s) => s.currentNode);
    const [baseInfo, setBaseInfo] = useState<BaseInfo | null>(null);
    const [currentInfo, setCurrentInfo] = useState<CurrentInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;
        Promise.all([loadBaseInfo('all', 'all'), loadCurrentInfo('all', 'all')])
            .then(([base, current]) => {
                if (!mounted) return;
                setBaseInfo(base.data);
                setCurrentInfo(current.data);
            })
            .catch((err) => {
                if (!mounted) return;
                setError(String(err));
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, [currentNode]);

    if (loading) {
        return (
            <div className="flex flex-col gap-4 p-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('commons.error', '加载失败')}</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (!baseInfo || !currentInfo) return null;

    const memoryPercent = currentInfo.memoryUsedPercent.toFixed(1);
    const cpuPercent = currentInfo.cpuUsedPercent.toFixed(1);
    const swapPercent = currentInfo.swapMemoryUsedPercent.toFixed(1);

    return (
        <div className="flex flex-col gap-4 p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('home.cpu', 'CPU')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{cpuPercent}%</div>
                        <p className="text-muted-foreground text-xs">
                            {baseInfo.cpuLogicalCores} {t('home.cores', '核心')} · {baseInfo.cpuModelName}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('home.memory', '内存')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{memoryPercent}%</div>
                        <p className="text-muted-foreground text-xs">
                            {formatBytes(currentInfo.memoryUsed)} / {formatBytes(currentInfo.memoryTotal)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('home.swap', '交换分区')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{swapPercent}%</div>
                        <p className="text-muted-foreground text-xs">
                            {formatBytes(currentInfo.swapMemoryUsed)} / {formatBytes(currentInfo.swapMemoryTotal)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('home.uptime', '运行时间')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{currentInfo.timeSinceUptime}</div>
                        <p className="text-muted-foreground text-xs">
                            {currentInfo.runningTime.days} {t('home.days', '天')} {currentInfo.runningTime.hours} {t('home.hours', '小时')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('home.system', '系统信息')}</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('home.hostname', '主机名')}</span>
                            <span>{baseInfo.hostname}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('home.os', '系统')}</span>
                            <span>{baseInfo.prettyDistro || baseInfo.platformVersion}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('home.kernel', '内核')}</span>
                            <span>{baseInfo.kernelVersion}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('home.arch', '架构')}</span>
                            <span>{baseInfo.kernelArch}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{t('home.ip', 'IP')}</span>
                            <span>{baseInfo.ipV4Addr}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('home.disk', '磁盘')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {currentInfo.diskData?.length ? (
                            <div className="flex flex-col gap-2">
                                {currentInfo.diskData.map((disk) => (
                                    <div key={disk.path} className="flex items-center justify-between text-sm">
                                        <span className="font-mono">{disk.path}</span>
                                        <span>
                                            {formatBytes(disk.used)} / {formatBytes(disk.total)} ({disk.usedPercent.toFixed(1)}%)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-sm">{t('commons.noData', '暂无数据')}</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('home.network', '网络')}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm md:grid-cols-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('home.netSent', '发送')}</span>
                        <span>{formatBytes(currentInfo.netBytesSent)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('home.netRecv', '接收')}</span>
                        <span>{formatBytes(currentInfo.netBytesRecv)}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
