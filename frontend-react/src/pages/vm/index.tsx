import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { searchVM, deleteVM, type VMInfo } from '@/api/vm';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function VMPage() {
    const { t } = useTranslation();
    const [vms, setVms] = useState<VMInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        searchVM({ page: 1, pageSize: 100 })
            .then((res) => setVms(res.data.items))
            .catch((error) => toast.error(String(error)))
            .finally(() => setLoading(false));
    }, []);

    const onDelete = async (id: number) => {
        if (!confirm(t('commons.confirmDelete', '确定删除？'))) return;
        try {
            await deleteVM(id);
            toast.success(t('commons.msg.deleteSuccess', '删除成功'));
            setVms((prev) => prev.filter((v) => v.id !== id));
        } catch {
            toast.error(t('commons.msg.deleteFailed', '删除失败'));
        }
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <h1 className="text-2xl font-bold">{t('menu.vm', '虚拟机')}</h1>

            <Card>
                <CardHeader>
                    <CardTitle>{t('vm.list', '虚拟机列表')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-64 w-full" />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('vm.name', '名称')}</TableHead>
                                    <TableHead>{t('vm.status', '状态')}</TableHead>
                                    <TableHead>{t('vm.cpu', 'CPU')}</TableHead>
                                    <TableHead>{t('vm.memory', '内存')}</TableHead>
                                    <TableHead>{t('commons.action', '操作')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vms.map((vm) => (
                                    <TableRow key={vm.id}>
                                        <TableCell className="font-medium">{vm.name}</TableCell>
                                        <TableCell>
                                            <Badge variant={vm.status === 'running' ? 'default' : 'secondary'}>
                                                {vm.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{vm.cpu}</TableCell>
                                        <TableCell>{vm.memory}</TableCell>
                                        <TableCell>
                                            <Button size="sm" variant="ghost" onClick={() => onDelete(vm.id)}>
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
