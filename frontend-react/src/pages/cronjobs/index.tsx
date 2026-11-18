import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { searchCronjobPage, deleteCronjob, type CronjobInfo } from '@/api/cronjob';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CronjobPage() {
    const { t } = useTranslation();
    const [jobs, setJobs] = useState<CronjobInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        searchCronjobPage({ page: 1, pageSize: 100 })
            .then((res) => setJobs(res.data.items))
            .catch((error) => toast.error(String(error)))
            .finally(() => setLoading(false));
    }, []);

    const onDelete = async (id: number) => {
        if (!confirm(t('commons.confirmDelete', '确定删除？'))) return;
        try {
            await deleteCronjob(id);
            toast.success(t('commons.msg.deleteSuccess', '删除成功'));
            setJobs((prev) => prev.filter((j) => j.id !== id));
        } catch {
            toast.error(t('commons.msg.deleteFailed', '删除失败'));
        }
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <h1 className="text-2xl font-bold">{t('menu.cronjob', '计划任务')}</h1>

            <Card>
                <CardHeader>
                    <CardTitle>{t('cronjob.list', '任务列表')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-64 w-full" />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('cronjob.name', '名称')}</TableHead>
                                    <TableHead>{t('cronjob.type', '类型')}</TableHead>
                                    <TableHead>{t('cronjob.spec', '表达式')}</TableHead>
                                    <TableHead>{t('cronjob.status', '状态')}</TableHead>
                                    <TableHead>{t('cronjob.nextTime', '下次执行')}</TableHead>
                                    <TableHead>{t('commons.action', '操作')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {jobs.map((job) => (
                                    <TableRow key={job.id}>
                                        <TableCell className="font-medium">{job.name}</TableCell>
                                        <TableCell>{job.type}</TableCell>
                                        <TableCell className="font-mono text-xs">{job.spec}</TableCell>
                                        <TableCell>
                                            <Badge variant={job.status === 'Enable' ? 'default' : 'secondary'}>
                                                {job.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{job.nextTime || '-'}</TableCell>
                                        <TableCell>
                                            <Button size="sm" variant="ghost" onClick={() => onDelete(job.id)}>
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
