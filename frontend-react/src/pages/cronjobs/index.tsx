import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { searchCronjobPage, deleteCronjob, addCronjob, type CronjobInfo } from '@/api/cronjob';
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

    const onCreate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const get = (key: string) => String(form.get(key) || '');
        try {
            await addCronjob({
                name: get('name'), type: 'shell', spec: get('spec'), command: get('command'),
                executor: 'bash', scriptMode: 'input', user: 'root', retainCopies: 0, retryTimes: 3, timeout: 300,
            });
            event.currentTarget.reset();
            const res = await searchCronjobPage({ page: 1, pageSize: 100 });
            setJobs(res.data.items || []);
            toast.success(t('commons.msg.createSuccess', '创建成功'));
        } catch (error) { toast.error(String(error)); }
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <h1 className="text-2xl font-bold">{t('menu.cronjob', '计划任务')}</h1>

            <Card>
                <CardHeader><CardTitle>{t('cronjob.create', '创建任务')}</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={onCreate} className="grid gap-3 md:grid-cols-4">
                        <div className="flex flex-col gap-2"><Label htmlFor="job-name">{t('cronjob.name', '名称')}</Label><Input id="job-name" name="name" required /></div>
                        <div className="flex flex-col gap-2"><Label htmlFor="job-spec">{t('cronjob.spec', '表达式')}</Label><Input id="job-spec" name="spec" placeholder="0 * * * *" required /></div>
                        <div className="flex flex-col gap-2"><Label htmlFor="job-command">{t('cronjob.command', '命令')}</Label><Input id="job-command" name="command" required /></div>
                        <Button type="submit" className="self-end">{t('commons.create', '创建')}</Button>
                    </form>
                </CardContent>
            </Card>

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
