import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createWebsite, preCheck } from '@/api/website';
import { ArrowLeft } from 'lucide-react';

export default function WebsiteCreatePage() {
    const { t } = useTranslation();
    const [type, setType] = useState('static');
    const [primaryDomain, setPrimaryDomain] = useState('');
    const [alias, setAlias] = useState('');
    const [remark, setRemark] = useState('');
    const [proxyAddress, setProxyAddress] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [created, setCreated] = useState(false);

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (submitting) return;
        if (type === 'proxy' && !proxyAddress.trim()) {
            toast.error(t('website.proxyAddress', '代理地址') + t('commons.required', '不能为空'));
            return;
        }
        setSubmitting(true);
        try {
            const conflicts = await preCheck();
            if (conflicts.data?.length) {
                toast.error(t('website.precheckFailed', '创建前检查未通过，请检查端口与域名冲突'));
                return;
            }
            await createWebsite({
                primaryDomain,
                type,
                alias,
                remark,
                appType: 'installed',
                appInstallId: 0,
                webSiteGroupId: 0,
                otherDomains: '',
                proxy: type === 'proxy' ? `http://${proxyAddress}` : '',
                IPV6: false,
                enableFtp: false,
                ftpUser: '',
                ftpPassword: '',
                proxyType: 'tcp',
                port: 9000,
                runtimeType: 'php',
                taskID: crypto.randomUUID(),
                createDb: false,
                enableSSL: false,
                domains: [{ domain: primaryDomain, port: 80, ssl: false }],
                name: '',
                algorithm: '',
                servers: [],
            });
            setCreated(true);
            toast.success(t('commons.msg.createSuccess', '创建成功'));
        } catch (error) {
            toast.error(String(error));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 p-6">
            <Link to="/websites"><Button variant="ghost" size="sm"><ArrowLeft data-icon="inline-start" />{t('commons.back', '返回')}</Button></Link>
            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>{t('website.create', '创建网站')}</CardTitle>
                    <CardDescription>{created ? t('commons.msg.createSuccess', '创建成功') : t('website.createHelper', '支持静态网站与反向代理，创建后可继续配置域名和 SSL')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label>{t('website.type', '类型')}</Label>
                            <Select value={type} onValueChange={(value) => setType(value ?? 'static')}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectGroup>
                                    <SelectItem value="static">{t('website.static', '静态网站')}</SelectItem>
                                    <SelectItem value="proxy">{t('website.proxy', '反向代理')}</SelectItem>
                                </SelectGroup></SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="domain">{t('website.primaryDomain', '主域名')}</Label>
                            <Input id="domain" value={primaryDomain} onChange={(event) => setPrimaryDomain(event.target.value)} placeholder="example.com" required />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="alias">{t('website.alias', '别名')}</Label>
                            <Input id="alias" value={alias} onChange={(event) => setAlias(event.target.value)} required />
                        </div>
                        {type === 'proxy' && <div className="flex flex-col gap-2">
                            <Label htmlFor="proxy">{t('website.proxyAddress', '代理地址')}</Label>
                            <Input id="proxy" value={proxyAddress} onChange={(event) => setProxyAddress(event.target.value)} placeholder="127.0.0.1:8080" required />
                        </div>}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="remark">{t('website.remark', '备注')}</Label>
                            <Input id="remark" value={remark} onChange={(event) => setRemark(event.target.value)} />
                        </div>
                        <Button type="submit" disabled={submitting || created}>{created ? t('commons.msg.createSuccess', '创建成功') : t('commons.create', '创建')}</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
