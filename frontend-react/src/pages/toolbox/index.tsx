import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getFail2banBaseInfo, operateFail2ban, searchFtp, deleteFtp, getSupervisorProcesses, type Fail2banBaseInfo, type FtpInfo, type SupervisorProcess } from '@/api/toolbox';
import { Play, Square, Trash2 } from 'lucide-react';

export default function ToolboxPage() {
    const { t } = useTranslation();
    const [fail2ban, setFail2ban] = useState<Fail2banBaseInfo | null>(null);
    const [ftps, setFtps] = useState<FtpInfo[]>([]);
    const [processes, setProcesses] = useState<SupervisorProcess[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = () => Promise.all([
        getFail2banBaseInfo(),
        searchFtp({ page: 1, pageSize: 100 }),
        getSupervisorProcesses(),
    ])
        .then(([f, ftp, proc]) => {
            setFail2ban(f.data);
            setFtps(ftp.data.items || []);
            setProcesses(proc.data || []);
        })
        .catch((error) => toast.error(String(error)))
        .finally(() => setLoading(false));

    useEffect(() => { void refresh(); }, []);

    const onFail2banOperate = async (operation: string) => {
        try {
            await operateFail2ban(operation);
            toast.success(t('commons.msg.success', '操作成功'));
            await refresh();
        } catch (error) { toast.error(String(error)); }
    };

    const onDeleteFtp = async (id: number) => {
        if (!window.confirm(t('commons.confirmDelete', '确定删除？'))) return;
        try {
            await deleteFtp(id);
            setFtps((prev) => prev.filter((f) => f.id !== id));
            toast.success(t('commons.msg.deleteSuccess', '删除成功'));
        } catch (error) { toast.error(String(error)); }
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <h1 className="text-2xl font-bold">{t('menu.toolbox', '工具箱')}</h1>
            <Tabs defaultValue="fail2ban">
                <TabsList>
                    <TabsTrigger value="fail2ban">Fail2ban</TabsTrigger>
                    <TabsTrigger value="ftp">FTP</TabsTrigger>
                    <TabsTrigger value="supervisor">Supervisor</TabsTrigger>
                </TabsList>
                <TabsContent value="fail2ban">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Fail2ban</span>
                                {fail2ban && <Badge variant={fail2ban.isActive ? 'default' : 'secondary'}>{fail2ban.isActive ? '运行中' : '已停止'}</Badge>}
                            </CardTitle>
                            <CardDescription>{fail2ban?.version || '-'}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex gap-2">
                            {loading ? <Skeleton className="h-8 w-32" /> : fail2ban?.isActive ? (
                                <Button variant="outline" onClick={() => onFail2banOperate('stop')}><Square data-icon="inline-start" />{t('commons.button.stop', '停止')}</Button>
                            ) : (
                                <Button onClick={() => onFail2banOperate('start')}><Play data-icon="inline-start" />{t('commons.button.start', '启动')}</Button>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="ftp">
                    <Card>
                        <CardHeader><CardTitle>FTP {t('toolbox.accounts', '账号')}</CardTitle></CardHeader>
                        <CardContent>
                            {loading ? <Skeleton className="h-32 w-full" /> : (
                                <Table>
                                    <TableHeader><TableRow><TableHead>{t('toolbox.user', '用户')}</TableHead><TableHead>{t('toolbox.path', '路径')}</TableHead><TableHead>{t('toolbox.status', '状态')}</TableHead><TableHead>{t('commons.action', '操作')}</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {ftps.map((ftp) => (
                                            <TableRow key={ftp.id}>
                                                <TableCell>{ftp.user}</TableCell>
                                                <TableCell className="font-mono">{ftp.path}</TableCell>
                                                <TableCell><Badge variant={ftp.status === 'Enable' ? 'default' : 'secondary'}>{ftp.status}</Badge></TableCell>
                                                <TableCell><Button size="sm" variant="ghost" onClick={() => onDeleteFtp(ftp.id)}><Trash2 /></Button></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="supervisor">
                    <Card>
                        <CardHeader><CardTitle>Supervisor {t('toolbox.processes', '进程')}</CardTitle></CardHeader>
                        <CardContent>
                            {loading ? <Skeleton className="h-32 w-full" /> : (
                                <Table>
                                    <TableHeader><TableRow><TableHead>{t('toolbox.name', '名称')}</TableHead><TableHead>{t('toolbox.status', '状态')}</TableHead><TableHead>{t('toolbox.numprocs', '进程数')}</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {processes.map((proc) => (
                                            <TableRow key={proc.name}>
                                                <TableCell>{proc.name}</TableCell>
                                                <TableCell><Badge variant={proc.status === 'RUNNING' ? 'default' : 'secondary'}>{proc.status}</Badge></TableCell>
                                                <TableCell>{proc.numprocs}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
