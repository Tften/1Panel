import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { searchContainer, containerOperate, type ContainerInfo } from '@/api/container';
import { Play, Square, RotateCw } from 'lucide-react';
import { toast } from 'sonner';

export default function ContainerPage() {
    const { t } = useTranslation();
    const [containers, setContainers] = useState<ContainerInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        searchContainer({ page: 1, pageSize: 100 })
            .then((res) => setContainers(res.data.items))
            .catch(() => undefined)
            .finally(() => setLoading(false));
    }, []);

    const onOperate = async (name: string, operation: string) => {
        try {
            await containerOperate({ names: [name], operation });
            toast.success(t('commons.msg.success', '操作成功'));
            setContainers((prev) =>
                prev.map((c) => (c.name === name ? { ...c, state: operation === 'start' ? 'running' : 'exited' } : c)),
            );
        } catch {
            toast.error(t('commons.msg.failed', '操作失败'));
        }
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <h1 className="text-2xl font-bold">{t('menu.container', '容器')}</h1>

            <Card>
                <CardHeader>
                    <CardTitle>{t('container.list', '容器列表')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-64 w-full" />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('container.name', '名称')}</TableHead>
                                    <TableHead>{t('container.image', '镜像')}</TableHead>
                                    <TableHead>{t('container.state', '状态')}</TableHead>
                                    <TableHead>{t('container.ports', '端口')}</TableHead>
                                    <TableHead>{t('container.runtime', '运行时间')}</TableHead>
                                    <TableHead>{t('commons.action', '操作')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {containers.map((c) => (
                                    <TableRow key={c.containerID}>
                                        <TableCell className="font-medium">{c.name}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">{c.imageName}</TableCell>
                                        <TableCell>
                                            <Badge variant={c.state === 'running' ? 'default' : 'secondary'}>
                                                {c.state}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{c.ports?.join(', ') || '-'}</TableCell>
                                        <TableCell>{c.runTime}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                {c.state === 'running' ? (
                                                    <Button size="sm" variant="ghost" onClick={() => onOperate(c.name, 'stop')}>
                                                        <Square className="size-4" />
                                                    </Button>
                                                ) : (
                                                    <Button size="sm" variant="ghost" onClick={() => onOperate(c.name, 'start')}>
                                                        <Play className="size-4" />
                                                    </Button>
                                                )}
                                                <Button size="sm" variant="ghost" onClick={() => onOperate(c.name, 'restart')}>
                                                    <RotateCw className="size-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
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
