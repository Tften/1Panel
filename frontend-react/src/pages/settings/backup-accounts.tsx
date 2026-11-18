import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { searchBackupAccounts, deleteBackupAccount, type BackupAccount } from '@/api/backup';
import { Trash2 } from 'lucide-react';

export default function BackupAccountsPage() {
    const { t } = useTranslation();
    const [accounts, setAccounts] = useState<BackupAccount[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = () => searchBackupAccounts({ page: 1, pageSize: 100 })
        .then((res) => setAccounts(res.data.items || []))
        .catch((error) => toast.error(String(error)))
        .finally(() => setLoading(false));

    useEffect(() => { void refresh(); }, []);

    const onDelete = async (account: BackupAccount) => {
        if (!window.confirm(t('commons.confirmDelete', '确定删除？'))) return;
        try {
            await deleteBackupAccount({ id: account.id, name: account.name, isPublic: account.isPublic });
            setAccounts((prev) => prev.filter((a) => a.id !== account.id));
            toast.success(t('commons.msg.deleteSuccess', '删除成功'));
        } catch (error) { toast.error(String(error)); }
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <h1 className="text-2xl font-bold">{t('setting.backupAccount', '备份账号')}</h1>
            <Card>
                <CardHeader><CardTitle>{t('backup.accounts', '备份账号列表')}</CardTitle></CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-64 w-full" /> : (
                        <Table>
                            <TableHeader><TableRow><TableHead>{t('backup.name', '名称')}</TableHead><TableHead>{t('backup.type', '类型')}</TableHead><TableHead>{t('backup.bucket', 'Bucket')}</TableHead><TableHead>{t('backup.path', '路径')}</TableHead><TableHead>{t('backup.public', '公共')}</TableHead><TableHead>{t('commons.action', '操作')}</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {accounts.map((account) => (
                                    <TableRow key={account.id}>
                                        <TableCell>{account.name}</TableCell>
                                        <TableCell>{account.type}</TableCell>
                                        <TableCell>{account.bucket || '-'}</TableCell>
                                        <TableCell className="font-mono">{account.backupPath || '-'}</TableCell>
                                        <TableCell><Badge variant={account.isPublic ? 'default' : 'secondary'}>{account.isPublic ? '是' : '否'}</Badge></TableCell>
                                        <TableCell><Button size="sm" variant="ghost" onClick={() => onDelete(account)}><Trash2 /></Button></TableCell>
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
