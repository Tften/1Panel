import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { searchMysqlDBs, deleteMysqlDB, addMysqlDB, type MysqlDBInfo } from '@/api/database';
import { Trash2 } from 'lucide-react';

export default function MysqlPage() {
    const { t } = useTranslation();
    const [dbs, setDbs] = useState<MysqlDBInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    const refresh = () => searchMysqlDBs({ info: '', database: '', page: 1, pageSize: 100 })
        .then((res) => setDbs(res.data.items || []))
        .catch((error) => toast.error(String(error)))
        .finally(() => setLoading(false));

    useEffect(() => { void refresh(); }, []);

    const onDelete = async (id: number) => {
        if (!window.confirm(t('commons.confirmDelete', '确定删除？'))) return;
        try {
            await deleteMysqlDB({ id, forceDelete: false });
            toast.success(t('commons.msg.deleteSuccess', '删除成功'));
            setDbs((prev) => prev.filter((d) => d.id !== id));
        } catch (error) { toast.error(String(error)); }
    };

    const onCreate = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const get = (key: string) => String(form.get(key) || '');
        setCreating(true);
        try {
            await addMysqlDB({
                name: get('name'), from: 'local', database: get('database'), format: 'utf8mb4', collation: '',
                username: get('username'), password: get('password'), permission: 'localhost', description: get('description'),
            });
            event.currentTarget.reset();
            await refresh();
            toast.success(t('commons.msg.createSuccess', '创建成功'));
        } catch (error) { toast.error(String(error)); } finally { setCreating(false); }
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">MySQL</h1><Link to="/databases/postgresql"><Button variant="outline">PostgreSQL</Button></Link></div>
            <Card>
                <CardHeader><CardTitle>{t('database.create', '创建数据库')}</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={onCreate} className="grid gap-3 md:grid-cols-3">
                        <div className="flex flex-col gap-2"><Label htmlFor="db-name">{t('database.name', '名称')}</Label><Input id="db-name" name="name" required /></div>
                        <div className="flex flex-col gap-2"><Label htmlFor="db-instance">{t('database.instance', '实例')}</Label><Input id="db-instance" name="database" required /></div>
                        <div className="flex flex-col gap-2"><Label htmlFor="db-user">{t('database.username', '用户名')}</Label><Input id="db-user" name="username" required /></div>
                        <div className="flex flex-col gap-2"><Label htmlFor="db-password">{t('database.password', '密码')}</Label><Input id="db-password" name="password" type="password" required /></div>
                        <div className="flex flex-col gap-2"><Label htmlFor="db-desc">{t('database.description', '描述')}</Label><Input id="db-desc" name="description" /></div>
                        <Button type="submit" disabled={creating} className="self-end">{t('commons.create', '创建')}</Button>
                    </form>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>{t('database.list', '数据库列表')}</CardTitle></CardHeader>
                <CardContent>{loading ? <Skeleton className="h-64 w-full" /> : <Table><TableHeader><TableRow><TableHead>{t('database.name', '名称')}</TableHead><TableHead>{t('database.username', '用户名')}</TableHead><TableHead>{t('database.permission', '权限')}</TableHead><TableHead>{t('database.description', '描述')}</TableHead><TableHead>{t('commons.action', '操作')}</TableHead></TableRow></TableHeader><TableBody>{dbs.map((db) => <TableRow key={db.id}><TableCell>{db.name}</TableCell><TableCell>{db.username}</TableCell><TableCell>{db.permission}</TableCell><TableCell>{db.description || '-'}</TableCell><TableCell><Button size="sm" variant="ghost" onClick={() => onDelete(db.id)}><Trash2 /></Button></TableCell></TableRow>)}</TableBody></Table>}</CardContent>
            </Card>
        </div>
    );
}
