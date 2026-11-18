import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { searchSnapshotPage, snapshotDelete, type SnapshotInfo } from '@/api/setting';
import { Trash2 } from 'lucide-react';

export default function SnapshotPage() {
    const { t } = useTranslation();
    const [snapshots, setSnapshots] = useState<SnapshotInfo[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = () => searchSnapshotPage({ page: 1, pageSize: 100 })
        .then((res) => setSnapshots(res.data.items || []))
        .catch((error) => toast.error(String(error)))
        .finally(() => setLoading(false));

    useEffect(() => { void refresh(); }, []);

    const onDelete = async (id: number) => {
        if (!window.confirm(t('commons.confirmDelete', '确定删除？'))) return;
        try {
            await snapshotDelete({ ids: [id], deleteWithFile: false });
            setSnapshots((prev) => prev.filter((s) => s.id !== id));
            toast.success(t('commons.msg.deleteSuccess', '删除成功'));
        } catch (error) { toast.error(String(error)); }
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <h1 className="text-2xl font-bold">{t('setting.snapshot', '快照')}</h1>
            <Card>
                <CardHeader><CardTitle>{t('snapshot.list', '快照列表')}</CardTitle></CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-64 w-full" /> : (
                        <Table>
                            <TableHeader><TableRow><TableHead>{t('snapshot.name', '名称')}</TableHead><TableHead>{t('snapshot.source', '来源')}</TableHead><TableHead>{t('snapshot.status', '状态')}</TableHead><TableHead>{t('snapshot.version', '版本')}</TableHead><TableHead>{t('snapshot.time', '时间')}</TableHead><TableHead>{t('commons.action', '操作')}</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {snapshots.map((snapshot) => (
                                    <TableRow key={snapshot.id}>
                                        <TableCell>{snapshot.name}</TableCell>
                                        <TableCell>{snapshot.sourceAccounts?.join(', ') || '-'}</TableCell>
                                        <TableCell><Badge variant={snapshot.status === 'Success' ? 'default' : 'secondary'}>{snapshot.status}</Badge></TableCell>
                                        <TableCell>{snapshot.version}</TableCell>
                                        <TableCell>{snapshot.createdAt}</TableCell>
                                        <TableCell><Button size="sm" variant="ghost" onClick={() => onDelete(snapshot.id)}><Trash2 /></Button></TableCell>
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
