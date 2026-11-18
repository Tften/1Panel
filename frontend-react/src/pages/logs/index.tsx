import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { getOperationLogs, getLoginLogs, type OperationLog, type LoginLog } from '@/api/log';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LogPage() {
    const { t } = useTranslation();
    const [opLogs, setOpLogs] = useState<OperationLog[]>([]);
    const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getOperationLogs({ page: 1, pageSize: 50 }), getLoginLogs({ page: 1, pageSize: 50 })])
            .then(([op, login]) => {
                setOpLogs(op.data.items);
                setLoginLogs(login.data.items);
            })
            .catch(() => undefined)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="flex flex-col gap-4 p-6">
            <h1 className="text-2xl font-bold">{t('menu.log', '日志')}</h1>

            <Tabs defaultValue="operation">
                <TabsList>
                    <TabsTrigger value="operation">{t('log.operation', '操作日志')}</TabsTrigger>
                    <TabsTrigger value="login">{t('log.login', '登录日志')}</TabsTrigger>
                </TabsList>
                <TabsContent value="operation">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('log.operation', '操作日志')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <Skeleton className="h-64 w-full" />
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t('log.ip', 'IP')}</TableHead>
                                            <TableHead>{t('log.user', '用户')}</TableHead>
                                            <TableHead>{t('log.operation', '操作')}</TableHead>
                                            <TableHead>{t('log.status', '状态')}</TableHead>
                                            <TableHead>{t('log.time', '时间')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {opLogs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell>{log.ip}</TableCell>
                                                <TableCell>{log.user}</TableCell>
                                                <TableCell>{log.operation}</TableCell>
                                                <TableCell>{log.status}</TableCell>
                                                <TableCell>{log.createdAt}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="login">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('log.login', '登录日志')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <Skeleton className="h-64 w-full" />
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>{t('log.ip', 'IP')}</TableHead>
                                            <TableHead>{t('log.user', '用户')}</TableHead>
                                            <TableHead>{t('log.status', '状态')}</TableHead>
                                            <TableHead>{t('log.message', '信息')}</TableHead>
                                            <TableHead>{t('log.time', '时间')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loginLogs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell>{log.ip}</TableCell>
                                                <TableCell>{log.user}</TableCell>
                                                <TableCell>{log.status}</TableCell>
                                                <TableCell>{log.message}</TableCell>
                                                <TableCell>{log.createdAt}</TableCell>
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
