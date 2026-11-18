import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { searchImage, searchNetwork, searchVolume, searchCompose, deleteImage, deleteNetwork, deleteVolume, deleteCompose } from '@/api/container';
import { ArrowLeft, Trash2 } from 'lucide-react';

type ResourceType = 'image' | 'network' | 'volume' | 'compose';

interface ResourceItem {
    id: string;
    name: string;
    subtitle?: string;
    status?: string;
    extra?: string;
}

export default function ContainerResourcePage({ type }: { type: ResourceType }) {
    const { t } = useTranslation();
    const [items, setItems] = useState<ResourceItem[]>([]);
    const [loading, setLoading] = useState(true);

    const search = () => {
        const params = { page: 1, pageSize: 100 };
        const handle = (res: { data: { items: unknown[] } }) => {
            setItems((res.data.items || []).map((item: unknown) => normalize(item, type)));
        };
        switch (type) {
            case 'image': return searchImage(params).then(handle);
            case 'network': return searchNetwork(params).then(handle);
            case 'volume': return searchVolume(params).then(handle);
            case 'compose': return searchCompose(params).then(handle);
        }
    };

    useEffect(() => {
        search()
            .catch((error) => toast.error(String(error)))
            .finally(() => setLoading(false));
    }, [type]);

    const onDelete = async (item: ResourceItem) => {
        if (!window.confirm(t('commons.confirmDelete', '确定删除？'))) return;
        try {
            const taskID = crypto.randomUUID();
            switch (type) {
                case 'image': await deleteImage({ names: [item.id], taskID }); break;
                case 'network': await deleteNetwork({ names: [item.id], taskID }); break;
                case 'volume': await deleteVolume({ names: [item.name], taskID }); break;
                case 'compose': await deleteCompose({ name: item.name, operation: 'down', path: item.extra || '', withFile: false, force: false }); break;
            }
            setItems((prev) => prev.filter((i) => i.id !== item.id));
            toast.success(t('commons.msg.deleteSuccess', '删除成功'));
        } catch (error) { toast.error(String(error)); }
    };

    const titles: Record<ResourceType, string> = {
        image: t('container.image', '镜像'),
        network: t('container.network', '网络'),
        volume: t('container.volume', '存储卷'),
        compose: t('container.compose', 'Compose'),
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-2">
                <Link to="/containers"><Button variant="ghost" size="sm"><ArrowLeft data-icon="inline-start" />{t('commons.back', '返回')}</Button></Link>
                <h1 className="text-2xl font-bold">{titles[type]}</h1>
            </div>
            <Card>
                <CardHeader><CardTitle>{titles[type]} {t('container.list', '列表')}</CardTitle></CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-64 w-full" /> : (
                        <Table>
                            <TableHeader><TableRow><TableHead>{t('container.name', '名称')}</TableHead><TableHead>{t('container.detail', '详情')}</TableHead><TableHead>{t('container.status', '状态')}</TableHead><TableHead>{t('commons.action', '操作')}</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {items.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell className="max-w-[300px] truncate">{item.subtitle || item.extra || '-'}</TableCell>
                                        <TableCell>{item.status && <Badge variant="secondary">{item.status}</Badge>}</TableCell>
                                        <TableCell><Button size="sm" variant="ghost" onClick={() => onDelete(item)}><Trash2 /></Button></TableCell>
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

function normalize(item: unknown, type: ResourceType): ResourceItem {
    const raw = item as Record<string, unknown>;
    switch (type) {
        case 'image': return { id: String(raw.id), name: String(raw.name), subtitle: (raw.tags as string[])?.join(', '), status: raw.isUsed ? '使用中' : '未使用' };
        case 'network': return { id: String(raw.id), name: String(raw.name), subtitle: `${raw.driver} ${raw.subnet || ''}`, status: raw.driver as string };
        case 'volume': return { id: String(raw.name), name: String(raw.name), subtitle: raw.mountpoint as string, status: raw.driver as string };
        case 'compose': return { id: String(raw.name), name: String(raw.name), subtitle: `${raw.containerCount} 容器`, status: `${raw.runningCount} 运行中`, extra: raw.workdir as string };
    }
}
