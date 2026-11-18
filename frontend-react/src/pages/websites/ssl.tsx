import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { searchSSL, deleteSSL, type SSL } from '@/api/website';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SSLPage() {
    const { t } = useTranslation();
    const [ssls, setSsls] = useState<SSL[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        searchSSL({ page: 1, pageSize: 100 })
            .then((res) => setSsls(res.data.items))
            .catch((error) => toast.error(String(error)))
            .finally(() => setLoading(false));
    }, []);

    const onDelete = async (id: number) => {
        if (!confirm(t('commons.confirmDelete', '确定删除？'))) return;
        try {
            await deleteSSL(id);
            toast.success(t('commons.msg.deleteSuccess', '删除成功'));
            setSsls((prev) => prev.filter((s) => s.id !== id));
        } catch {
            toast.error(t('commons.msg.deleteFailed', '删除失败'));
        }
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-2">
                <Link to="/websites">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-1 size-4" />
                        {t('commons.back', '返回')}
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">{t('menu.ssl', 'SSL 证书')}</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('ssl.list', '证书列表')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-64 w-full" />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('ssl.domain', '域名')}</TableHead>
                                    <TableHead>{t('ssl.organization', '组织')}</TableHead>
                                    <TableHead>{t('ssl.expireDate', '过期时间')}</TableHead>
                                    <TableHead>{t('ssl.status', '状态')}</TableHead>
                                    <TableHead>{t('commons.action', '操作')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ssls.map((ssl) => (
                                    <TableRow key={ssl.id}>
                                        <TableCell className="font-medium">{ssl.primaryDomain}</TableCell>
                                        <TableCell>{ssl.organization || '-'}</TableCell>
                                        <TableCell>{ssl.expireDate}</TableCell>
                                        <TableCell>
                                            <Badge variant={ssl.status === 'Running' ? 'default' : 'secondary'}>
                                                {ssl.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button size="sm" variant="ghost" onClick={() => onDelete(ssl.id)}>
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
