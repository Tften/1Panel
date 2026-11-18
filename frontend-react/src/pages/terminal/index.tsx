import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { searchHosts, deleteHost, type HostInfo } from '@/api/terminal';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TerminalPage() {
    const { t } = useTranslation();
    const [hosts, setHosts] = useState<HostInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        searchHosts({ page: 1, pageSize: 100 })
            .then((res) => setHosts(res.data.items))
            .catch(() => undefined)
            .finally(() => setLoading(false));
    }, []);

    const onDelete = async (id: number) => {
        if (!confirm(t('commons.confirmDelete', '确定删除？'))) return;
        try {
            await deleteHost(id);
            toast.success(t('commons.msg.deleteSuccess', '删除成功'));
            setHosts((prev) => prev.filter((h) => h.id !== id));
        } catch {
            toast.error(t('commons.msg.deleteFailed', '删除失败'));
        }
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <h1 className="text-2xl font-bold">{t('menu.terminal', '终端')}</h1>

            <Card>
                <CardHeader>
                    <CardTitle>{t('terminal.hosts', '主机列表')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-64 w-full" />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('terminal.name', '名称')}</TableHead>
                                    <TableHead>{t('terminal.addr', '地址')}</TableHead>
                                    <TableHead>{t('terminal.port', '端口')}</TableHead>
                                    <TableHead>{t('terminal.user', '用户')}</TableHead>
                                    <TableHead>{t('commons.action', '操作')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {hosts.map((host) => (
                                    <TableRow key={host.id}>
                                        <TableCell className="font-medium">{host.name}</TableCell>
                                        <TableCell>{host.addr}</TableCell>
                                        <TableCell>{host.port}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{host.user}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button size="sm" variant="ghost" onClick={() => onDelete(host.id)}>
                                                <Trash2 className="size-4" />
                                            </Button>
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
