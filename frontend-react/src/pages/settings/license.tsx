import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { searchLicense, getLicenseStatus, deleteLicense, type License } from '@/api/setting';
import { Trash2 } from 'lucide-react';

export default function LicensePage() {
    const { t } = useTranslation();
    const [licenses, setLicenses] = useState<License[]>([]);
    const [status, setStatus] = useState<{ productPro: string; status: string } | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = () => Promise.all([
        searchLicense({ page: 1, pageSize: 100 }),
        getLicenseStatus(),
    ])
        .then(([l, s]) => {
            setLicenses(l.data.items || []);
            setStatus(s.data);
        })
        .catch((error) => toast.error(String(error)))
        .finally(() => setLoading(false));

    useEffect(() => { void refresh(); }, []);

    const onDelete = async (id: number) => {
        if (!window.confirm(t('commons.confirmDelete', '确定删除？'))) return;
        try {
            await deleteLicense({ ids: id });
            setLicenses((prev) => prev.filter((l) => l.licenseName !== licenses.find((x) => x.licenseName === l.licenseName)?.licenseName));
            toast.success(t('commons.msg.deleteSuccess', '删除成功'));
        } catch (error) { toast.error(String(error)); }
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <h1 className="text-2xl font-bold">{t('setting.license', '许可证')}</h1>
            <Card>
                <CardHeader><CardTitle className="flex items-center justify-between"><span>{t('license.status', '许可证状态')}</span>{status && <Badge variant={status.status === 'Enable' ? 'default' : 'secondary'}>{status.status}</Badge>}</CardTitle></CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-32 w-full" /> : (
                        <Table>
                            <TableHeader><TableRow><TableHead>{t('license.name', '名称')}</TableHead><TableHead>{t('license.assignee', '被许可人')}</TableHead><TableHead>{t('license.product', '产品')}</TableHead><TableHead>{t('license.version', '版本')}</TableHead><TableHead>{t('license.status', '状态')}</TableHead><TableHead>{t('commons.action', '操作')}</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {licenses.map((license, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{license.licenseName}</TableCell>
                                        <TableCell>{license.assigneeName}</TableCell>
                                        <TableCell>{license.productPro}</TableCell>
                                        <TableCell>{license.versionConstraint}</TableCell>
                                        <TableCell><Badge variant={license.status === 'Enable' ? 'default' : 'secondary'}>{license.status}</Badge></TableCell>
                                        <TableCell><Button size="sm" variant="ghost" onClick={() => onDelete(i)}><Trash2 /></Button></TableCell>
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
