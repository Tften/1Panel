import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { getAppByKey, getAppDetail, installApp, type AppDetail, type AppFormField, type AppItem } from '@/api/app';
import { ArrowLeft, Download } from 'lucide-react';

export default function AppDetailPage() {
    const { t, i18n } = useTranslation();
    const { key } = useParams();
    const [app, setApp] = useState<AppItem | null>(null);
    const [detail, setDetail] = useState<AppDetail | null>(null);
    const [version, setVersion] = useState('');
    const [name, setName] = useState('');
    const [params, setParams] = useState<Record<string, unknown>>({});
    const [loading, setLoading] = useState(true);
    const [loadingVersion, setLoadingVersion] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [installed, setInstalled] = useState(false);

    useEffect(() => {
        if (!key) return;
        getAppByKey(key)
            .then((res) => {
                setApp(res.data);
                setName(res.data.key.replace(/^local/, ''));
                if (res.data.versions?.length) setVersion(res.data.versions[0]);
            })
            .catch((error) => toast.error(String(error)))
            .finally(() => setLoading(false));
    }, [key]);

    useEffect(() => {
        if (!app || !version) return;
        getAppDetail(app.id, version, 'app')
            .then((res) => {
                setDetail(res.data);
                const defaults: Record<string, unknown> = {};
                for (const field of res.data.params?.formFields || []) {
                    defaults[field.envKey] = field.default ?? '';
                }
                setParams(defaults);
                setLoadingVersion(version);
            })
            .catch((error) => toast.error(String(error)));
    }, [app, version]);

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!detail || submitting) return;
        const missing = (detail.params?.formFields || []).find(
            (field) => field.required && String(params[field.envKey] ?? '').trim() === '',
        );
        if (missing) {
            toast.error(`${fieldLabel(missing, i18n.language)} ${t('commons.required', '不能为空')}`);
            return;
        }
        setSubmitting(true);
        try {
            await installApp({
                appDetailId: detail.id,
                params,
                taskID: crypto.randomUUID(),
                name,
                advanced: true,
                cpuQuota: 0,
                memoryLimit: 0,
                memoryUnit: 'M',
                containerName: '',
                allowPort: false,
                editCompose: false,
                dockerCompose: detail.dockerCompose,
                version,
                pullImage: true,
                restartPolicy: 'always',
            });
            setInstalled(true);
            toast.success(t('app.installSuccess', '安装任务已提交'));
        } catch (error) {
            toast.error(String(error));
        } finally {
            setSubmitting(false);
        }
    };

    const installedVersion = Boolean(detail && version === loadingVersion);
    const detailLoading = Boolean(version && version !== loadingVersion);

    if (loading) return <Skeleton className="m-6 h-64 w-full" />;
    if (!app) return <div className="p-6">{t('commons.notFound', '未找到应用')}</div>;

    return (
        <div className="flex flex-col gap-4 p-6">
            <Link to="/apps">
                <Button variant="ghost" size="sm"><ArrowLeft data-icon="inline-start" />{t('commons.back', '返回')}</Button>
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle>{app.name}</CardTitle>
                    <CardDescription>{app.shortDescZh || app.shortDescEn}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="app-name">{t('app.name', '名称')}</Label>
                            <Input id="app-name" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label>{t('app.version', '版本')}</Label>
                            <Select value={version} onValueChange={(value) => setVersion(value ?? '')}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent><SelectGroup>{app.versions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectGroup></SelectContent>
                            </Select>
                        </div>
                        {detailLoading ? <Skeleton className="h-32 w-full" /> : detail?.params?.formFields?.map((field) => (
                            <FormField key={field.envKey} field={field} language={i18n.language} value={params[field.envKey]} onChange={(value) => setParams((old) => ({ ...old, [field.envKey]: value }))} />
                        ))}
                        <Button type="submit" disabled={!installedVersion || detailLoading || submitting || installed}>
                            <Download data-icon="inline-start" />{installed ? t('app.installed', '已安装') : t('app.install', '安装')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

function fieldLabel(field: AppFormField, language: string) {
    return field.label?.[language] || (language === 'zh' ? field.labelZh : field.labelEn) || field.envKey;
}

function FormField({ field, language, value, onChange }: { field: AppFormField; language: string; value: unknown; onChange: (value: unknown) => void }) {
    const stringValue = String(value ?? '');
    return (
        <div className="flex flex-col gap-2">
            <Label htmlFor={`param-${field.envKey}`}>{fieldLabel(field, language)}{field.required ? ' *' : ''}</Label>
            {field.type === 'select' ? (
                <Select value={stringValue} onValueChange={onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectGroup>{field.values?.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectGroup></SelectContent>
                </Select>
            ) : field.type === 'switch' ? (
                <Switch checked={stringValue === 'true' || stringValue === 'Enable'} onCheckedChange={(checked) => onChange(checked)} />
            ) : (
                <Input id={`param-${field.envKey}`} type={field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'} value={stringValue} required={field.required} onChange={(event) => onChange(field.type === 'number' ? Number(event.target.value) : event.target.value)} />
            )}
            {field.description?.[language] && <p className="text-muted-foreground text-xs">{field.description[language]}</p>}
        </div>
    );
}
