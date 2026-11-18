import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { searchWebsites, deleteWebsite, opWebsite, type WebsiteRes } from '@/api/website';
import { Search, Plus, Trash2, Play, Square } from 'lucide-react';
import { toast } from 'sonner';

export default function WebsitePage() {
    const { t } = useTranslation();
    const [websites, setWebsites] = useState<WebsiteRes[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        searchWebsites({ page, pageSize: 20, name: search || undefined })
            .then((res) => {
                setWebsites(res.data.items);
                setTotal(res.data.total);
            })
            .catch(() => undefined)
            .finally(() => setLoading(false));
    }, [page, search]);

    const onDelete = async (id: number) => {
        if (!confirm(t('commons.confirmDelete', '确定删除？'))) return;
        try {
            await deleteWebsite({ id, deleteApp: false, deleteBackup: false, forceDelete: false });
            toast.success(t('commons.msg.deleteSuccess', '删除成功'));
            setWebsites((prev) => prev.filter((w) => w.id !== id));
        } catch {
            toast.error(t('commons.msg.deleteFailed', '删除失败'));
        }
    };

    const onOperate = async (id: number, operate: string) => {
        try {
            await opWebsite({ id, operate });
            toast.success(t('commons.msg.success', '操作成功'));
        } catch {
            toast.error(t('commons.msg.failed', '操作失败'));
        }
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t('menu.website', '网站')}</h1>
                <div className="flex gap-2">
                    <Link to="/websites/ssl">
                        <Button variant="outline">{t('menu.ssl', 'SSL')}</Button>
                    </Link>
                    <Link to="/websites/create">
                        <Button>
                            <Plus className="mr-1 size-4" />
                            {t('commons.create', '创建')}
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="text-muted-foreground absolute left-2 top-2.5 size-4" />
                    <Input
                        placeholder={t('commons.search', '搜索')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('website.list', '网站列表')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-64 w-full" />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('website.domain', '域名')}</TableHead>
                                    <TableHead>{t('website.type', '类型')}</TableHead>
                                    <TableHead>{t('website.status', '状态')}</TableHead>
                                    <TableHead>{t('website.remark', '备注')}</TableHead>
                                    <TableHead>{t('commons.action', '操作')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {websites.map((site) => (
                                    <TableRow key={site.id}>
                                        <TableCell className="font-medium">{site.primaryDomain}</TableCell>
                                        <TableCell>{site.type}</TableCell>
                                        <TableCell>
                                            <Badge variant={site.status === 'Running' ? 'default' : 'secondary'}>
                                                {site.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{site.remark || '-'}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => onOperate(site.id, site.status === 'Running' ? 'stop' : 'start')}
                                                >
                                                    {site.status === 'Running' ? <Square className="size-4" /> : <Play className="size-4" />}
                                                </Button>
                                                <Link to={`/websites/${site.id}/config`}>
                                                    <Button size="sm" variant="ghost">
                                                        {t('commons.config', '配置')}
                                                    </Button>
                                                </Link>
                                                <Button size="sm" variant="ghost" onClick={() => onDelete(site.id)}>
                                                    <Trash2 className="size-4" />
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

            <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                    {t('commons.total', '共')} {total} {t('commons.items', '条')}
                </span>
                <div className="flex gap-2">
                    <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} variant="outline" size="sm">
                        {t('commons.prev', '上一页')}
                    </Button>
                    <Button
                        disabled={page * 20 >= total}
                        onClick={() => setPage((p) => p + 1)}
                        variant="outline"
                        size="sm"
                    >
                        {t('commons.next', '下一页')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
