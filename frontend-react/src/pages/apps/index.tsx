import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { searchApp, getAppTags, type AppItem } from '@/api/app';
import { Search, Download } from 'lucide-react';

export default function AppStorePage() {
    const { t } = useTranslation();
    const [apps, setApps] = useState<AppItem[]>([]);
    const [tags, setTags] = useState<{ key: string; name: string }[]>([]);
    const [selectedTag, setSelectedTag] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        getAppTags().then((res) => setTags(res.data)).catch(() => undefined);
    }, []);

    useEffect(() => {
        searchApp({
            page,
            pageSize: 20,
            name: search || undefined,
            tags: selectedTag ? [selectedTag] : undefined,
        })
            .then((res) => {
                setApps(res.data.items);
                setTotal(res.data.total);
            })
            .catch(() => undefined)
            .finally(() => setLoading(false));
    }, [page, search, selectedTag]);

    return (
        <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{t('app.apps', '应用商店')}</h1>
                <Link to="/apps/installed">
                    <Button variant="outline">{t('app.installed', '已安装')}</Button>
                </Link>
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

            <div className="flex flex-wrap gap-2">
                <Button
                    variant={selectedTag === '' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTag('')}
                >
                    {t('commons.all', '全部')}
                </Button>
                {tags.map((tag) => (
                    <Button
                        key={tag.key}
                        variant={selectedTag === tag.key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedTag(tag.key)}
                    >
                        {tag.name}
                    </Button>
                ))}
            </div>

            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-40" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {apps.map((app) => (
                        <Card key={app.id} className="flex flex-col">
                            <CardHeader className="flex flex-row items-center gap-3">
                                {app.icon && <img src={app.icon} alt={app.name} className="size-10 rounded" />}
                                <div className="flex-1">
                                    <CardTitle className="text-lg">{app.name}</CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {app.shortDescZh || app.shortDescEn || app.description}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-1 flex-col justify-between gap-2">
                                <div className="flex flex-wrap gap-1">
                                    {app.tags?.map((tag) => (
                                        <Badge key={tag.key} variant="secondary">
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                                <div className="flex justify-between">
                                    <Link to={`/apps/detail/${app.key}`}>
                                        <Button size="sm">{t('commons.detail', '详情')}</Button>
                                    </Link>
                                    {app.installed ? (
                                        <Badge variant="outline">{t('app.installed', '已安装')}</Badge>
                                    ) : (
                                        <Button size="sm" variant="default" asChild>
                                            <Link to={`/apps/detail/${app.key}`}>
                                                <Download data-icon="inline-start" />
                                                {t('app.install', '安装')}
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

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
