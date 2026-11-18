import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { searchMysqlDBs, deleteMysqlDB, type MysqlDBInfo } from '@/api/database';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MysqlPage() {
    const { t } = useTranslation();
    const [dbs, setDbs] = useState<MysqlDBInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        searchMysqlDBs({ info: '', database: '', page: 1, pageSize: 100 })
            .then((res) => setDbs(res.data.items))
            .catch(() => undefined)
            .finally(() => setLoading(false));
    }, []);

    const onDelete = async (id: number) => {
        if (!confirm(t('commons.confirmDelete', '确定删除？'))) return;
        try {
            await deleteMysqlDB({ id, forceDelete: false });
            toast.success(t('commons.msg.deleteSuccess', '删除成功'));
            setDbs((prev) => prev.filter((d) => d.id !== id));
        } catch {
            toast.error(t('commons.msg.deleteFailed', '删除失败'));
        }
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">MySQL</h1>
                <div className="flex gap-2">
                    <Link to="/databases/postgresql">
                        <Button variant="outline">PostgreSQL</Button>
                    </Link>
                    <Link to="/databases/redis">
                        <Button variant="outline">Redis</Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('database.list', '数据库列表')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-64 w-full" />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('database.name', '名称')}</TableHead>
                                    <TableHead>{t('database.username', '用户名')}</TableHead>
                                    <TableHead>{t('database.permission', '权限')}</TableHead>
                                    <TableHead>{t('database.description', '描述')}</TableHead>
                                    <TableHead>{t('commons.action', '操作')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dbs.map((db) => (
                                    <TableRow key={db.id}>
                                        <TableCell className="font-medium">{db.name}</TableCell>
                                        <TableCell>{db.username}</TableCell>
                                        <TableCell>{db.permission}</TableCell>
                                        <TableCell>{db.description || '-'}</TableCell>
                                        <TableCell>
                                            <Button size="sm" variant="ghost" onClick={() => onDelete(db.id)}>
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
