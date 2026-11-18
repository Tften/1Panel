import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { searchFirewallRules, getSSHInfo, getDiskInfo, getListeningProcess } from '@/api/host-sub';

type HostPageType = 'firewall' | 'ssh' | 'process' | 'disk';

export default function HostSubPage({ type }: { type: HostPageType }) {
    const { t } = useTranslation();
    const [data, setData] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetcher = () => {
            switch (type) {
                case 'firewall': return searchFirewallRules({ page: 1, pageSize: 100, info: '', scopes: [] }).then((res) => setData(res.data.items || []));
                case 'ssh': return getSSHInfo().then((res) => setData([res.data]));
                case 'disk': return getDiskInfo().then((res) => setData(res.data.disks || []));
                case 'process': return getListeningProcess().then((res) => setData(res.data || []));
            }
        };
        fetcher()
            ?.catch((error) => toast.error(String(error)))
            .finally(() => setLoading(false));
    }, [type]);

    const titles: Record<HostPageType, string> = {
        firewall: t('menu.firewall', '防火墙'),
        ssh: t('menu.ssh', 'SSH'),
        process: t('menu.processManage', '进程'),
        disk: t('menu.disk', '磁盘'),
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <h1 className="text-2xl font-bold">{titles[type]}</h1>
            <Card>
                <CardHeader><CardTitle>{titles[type]} {t('host.list', '列表')}</CardTitle></CardHeader>
                <CardContent>
                    {loading ? <Skeleton className="h-64 w-full" /> : <Content type={type} data={data} />}
                </CardContent>
            </Card>
        </div>
    );
}

function Content({ type, data }: { type: HostPageType; data: unknown[] }) {
    const { t } = useTranslation();
    switch (type) {
        case 'firewall':
            return (
                <Table>
                    <TableHeader><TableRow><TableHead>{t('firewall.protocol', '协议')}</TableHead><TableHead>{t('firewall.source', '来源')}</TableHead><TableHead>{t('firewall.port', '端口')}</TableHead><TableHead>{t('firewall.action', '动作')}</TableHead><TableHead>{t('firewall.description', '描述')}</TableHead></TableRow></TableHeader>
                    <TableBody>{data.map((item, i) => { const r = (item as { rule: { protocol: string; sourceAddress?: string; destinationPort?: string; action: string; description?: string } }).rule; return <TableRow key={i}><TableCell>{r.protocol}</TableCell><TableCell>{r.sourceAddress || '-'}</TableCell><TableCell>{r.destinationPort || '-'}</TableCell><TableCell><Badge variant={r.action === 'accept' ? 'default' : 'destructive'}>{r.action}</Badge></TableCell><TableCell>{r.description || '-'}</TableCell></TableRow>; })}</TableBody>
                </Table>
            );
        case 'ssh':
            return data.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                    {Object.entries(data[0] as Record<string, string>).map(([key, value]) => <div key={key} className="flex justify-between rounded border p-3 text-sm"><span className="text-muted-foreground">{key}</span><span className="font-mono">{value || '-'}</span></div>)}
                </div>
            ) : null;
        case 'disk':
            return (
                <Table>
                    <TableHeader><TableRow><TableHead>{t('disk.name', '名称')}</TableHead><TableHead>{t('disk.size', '大小')}</TableHead><TableHead>{t('disk.type', '类型')}</TableHead><TableHead>{t('disk.mountpoint', '挂载点')}</TableHead><TableHead>{t('disk.fstype', '文件系统')}</TableHead></TableRow></TableHeader>
                    <TableBody>{data.map((item, i) => { const d = item as { name: string; size: string; type: string; mountpoint: string; fstype: string }; return <TableRow key={i}><TableCell className="font-mono">{d.name}</TableCell><TableCell>{d.size}</TableCell><TableCell>{d.type}</TableCell><TableCell className="font-mono">{d.mountpoint}</TableCell><TableCell>{d.fstype}</TableCell></TableRow>; })}</TableBody>
                </Table>
            );
        case 'process':
            return (
                <Table>
                    <TableHeader><TableRow><TableHead>PID</TableHead><TableHead>{t('process.name', '名称')}</TableHead><TableHead>{t('process.user', '用户')}</TableHead><TableHead>CPU</TableHead><TableHead>{t('process.memory', '内存')}</TableHead><TableHead>{t('process.status', '状态')}</TableHead></TableRow></TableHeader>
                    <TableBody>{data.map((item, i) => { const p = item as { pid: number; name: string; user: string; cpu: number; memory: number; status: string }; return <TableRow key={i}><TableCell className="font-mono">{p.pid}</TableCell><TableCell>{p.name}</TableCell><TableCell>{p.user}</TableCell><TableCell>{p.cpu?.toFixed(1)}%</TableCell><TableCell>{p.memory?.toFixed(1)}%</TableCell><TableCell><Badge variant="secondary">{p.status}</Badge></TableCell></TableRow>; })}</TableBody>
                </Table>
            );
    }
}
