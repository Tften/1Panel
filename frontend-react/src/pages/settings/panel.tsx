import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSettingInfo, updateSetting, type SettingInfo } from '@/api/setting';
import { setTheme } from '@/lib/theme';
import { setActiveLocale } from '@/i18n';

export default function SettingPage() {
    const { t } = useTranslation();
    const [form, setForm] = useState<Partial<SettingInfo>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getSettingInfo()
            .then((res) => setForm(res.data))
            .catch((error) => toast.error(String(error)))
            .finally(() => setLoading(false));
    }, []);

    const save = async (key: string, value: string) => {
        setSaving(true);
        try {
            await updateSetting({ key, value });
            if (key === 'Theme') setTheme(value as 'light' | 'dark' | 'auto');
            if (key === 'Language') await setActiveLocale(value);
            toast.success(t('commons.msg.saveSuccess', '保存成功'));
        } catch (error) {
            toast.error(String(error));
        } finally {
            setSaving(false);
        }
    };

    const savePanelName = async (event: FormEvent) => {
        event.preventDefault();
        if (!form.panelName?.trim()) {
            toast.error(t('setting.panelName', '面板名称') + t('commons.required', '不能为空'));
            return;
        }
        await save('PanelName', form.panelName.trim());
    };

    if (loading) return <div className="p-6">{t('commons.loading', '加载中...')}</div>;

    return (
        <div className="flex flex-col gap-6 p-6">
            <Card>
                <CardHeader><CardTitle>{t('setting.panel', '面板设置')}</CardTitle></CardHeader>
                <CardContent className="grid max-w-3xl gap-4 md:grid-cols-2">
                    <form onSubmit={savePanelName} className="flex flex-col gap-2">
                        <Label htmlFor="panel-name">{t('setting.panelName', '面板名称')}</Label>
                        <div className="flex gap-2">
                            <Input id="panel-name" value={form.panelName || ''} onChange={(event) => setForm((old) => ({ ...old, panelName: event.target.value }))} />
                            <Button type="submit" disabled={saving}>{t('commons.button.save', '保存')}</Button>
                        </div>
                    </form>
                    <div className="flex flex-col gap-2">
                        <Label>{t('setting.theme', '主题')}</Label>
                        <Select value={form.theme || 'auto'} onValueChange={(value) => save('Theme', value ?? 'auto')}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectGroup>
                                <SelectItem value="light">{t('setting.light', '浅色')}</SelectItem>
                                <SelectItem value="dark">{t('setting.dark', '深色')}</SelectItem>
                                <SelectItem value="auto">{t('setting.auto', '跟随系统')}</SelectItem>
                            </SelectGroup></SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>{t('setting.language', '语言')}</Label>
                        <Select value={form.language || 'en'} onValueChange={(value) => save('Language', value ?? 'en')}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectGroup>
                                <SelectItem value="zh">简体中文</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                            </SelectGroup></SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label>{t('setting.menuTabs', '页签')}</Label>
                        <Select value={form.menuTabs || 'Disable'} onValueChange={(value) => save('MenuTabs', value ?? 'Disable')}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectGroup>
                                <SelectItem value="Enable">{t('commons.button.enable', '开启')}</SelectItem>
                                <SelectItem value="Disable">{t('commons.button.disable', '关闭')}</SelectItem>
                            </SelectGroup></SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
