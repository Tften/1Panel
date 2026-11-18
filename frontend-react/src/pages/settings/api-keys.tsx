import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { searchAPIKeys, deleteAPIKey, revokeAPIKey, type APIKey } from '@/api/api-key';
import { Trash2, Ban } from 'lucide-react';

export default function APIKeysPage() {
    const { t } = useTranslation();
    const [keys, setKeys] = useState<APIKey[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = () => searchAPIKeys({ page: 1, pageSize: 100 })
        .then((res) => setKeys(res.data.items || []))
        .catch((error) => toast.error(String(error)))
        .finally(() => setLoading(false));

    useEffect(() => { void refresh(); }, []);

    const onDelete = async (key: APIKey) => {
        if (!window.confirm(t('commons.confirmDelete', '确定删除？'))) return;
        try {
            await deleteAPIKey({ id: key.id, revision: key.revision });
            setKeys((prev) => prev.filter((k) => k.id !== key.id));
            toast.success(t('commons.msg.deleteSuccess', '删除成功'));
        } catch (error) { toast.error(String(error)); }
    };

    const onRevoke = async (key: APIKey) => {
        try {
            await revokeAPIKey({ id: key.id, revision: key.revision });
            toast.success(t('commons.msg.success', '操作成功'));
            await refresh();
        } catch (error) { toast.error(String(error)); }
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <h1 className="text-2xl font-bold">{t('apiKeyManagement.title', 'API 密钥')}</h1>
            <Card>
                <CardHeader><CardTitle>{t('apiKeyManagement.list', '密钥列表')}</CardTitle></CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-64 w-full" /> : (
                        <Table>
                            <TableHeader><TableRow><TableHead>{t('apiKeyManagement.name', '名称')}</TableHead><TableHead>{t('apiKeyManagement.key', '密钥')}</TableHead><TableHead>{t('apiKeyManagement.status', '状态')}</TableHead><TableHead>{t('apiKeyManagement.createdAt', '创建时间')}</TableHead><TableHead>{t('commons.action', '操作')}</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {keys.map((key) => (
                                    <TableRow key={key.id}>
                                        <TableCell>{key.name}</TableCell>
                                        <TableCell className="font-mono">{key.keyHint}</TableCell>
                                        <TableCell><Badge variant={key.status === 'Enable' ? 'default' : 'secondary'}>{key.status}</Badge></TableCell>
                                        <TableCell>{key.createdAt}</TableCell>
                                        <TableCell><div className="flex gap-1">
                                            {key.status === 'Enable' && <Button size="sm" variant="ghost" onClick={() => onRevoke(key)}><Ban /></Button>}
                                            <Button size="sm" variant="ghost" onClick={() => onDelete(key)}><Trash2 /></Button>
                                        </div></TableCell>
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
