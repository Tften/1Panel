import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { getSettingInfo, updateSetting, type SettingInfo } from '@/api/setting';

interface SettingField {
    key: keyof SettingInfo;
    label: string;
    type: 'text' | 'number' | 'select' | 'switch' | 'password';
    options?: { value: string; label: string }[];
    description?: string;
}

interface SettingSection {
    title: string;
    description?: string;
    fields: SettingField[];
}

const sections: SettingSection[] = [
    {
        title: 'setting.panel',
        fields: [
            { key: 'panelName', label: 'setting.panelName', type: 'text' },
            {
                key: 'theme',
                label: 'setting.theme',
                type: 'select',
                options: [
                    { value: 'light', label: 'setting.light' },
                    { value: 'dark', label: 'setting.dark' },
                    { value: 'auto', label: 'setting.auto' },
                ],
            },
            {
                key: 'language',
                label: 'setting.language',
                type: 'select',
                options: [
                    { value: 'zh', label: '简体中文' },
                    { value: 'en', label: 'English' },
                ],
            },
            {
                key: 'menuTabs',
                label: 'setting.menuTabs',
                type: 'select',
                options: [
                    { value: 'Enable', label: 'commons.button.enable' },
                    { value: 'Disable', label: 'commons.button.disable' },
                ],
            },
            { key: 'sessionTimeout', label: 'setting.sessionTimeout', type: 'number' },
        ],
    },
    {
        title: 'setting.safe',
        fields: [
            { key: 'serverPort', label: 'setting.panelPort', type: 'number' },
            { key: 'bindAddress', label: 'setting.bindInfo', type: 'text' },
            { key: 'securityEntrance', label: 'setting.entrance', type: 'password' },
            { key: 'ssl', label: 'setting.ssl', type: 'switch' },
            { key: 'allowIPs', label: 'setting.allowIPs', type: 'text' },
            { key: 'bindDomain', label: 'setting.bindDomain', type: 'text' },
        ],
    },
    {
        title: 'setting.system',
        fields: [
            { key: 'developerMode', label: 'setting.developerMode', type: 'switch' },
            { key: 'upgradeBackupCopies', label: 'setting.upgradeBackupCopies', type: 'text' },
            { key: 'proxyUrl', label: 'setting.proxyUrl', type: 'text' },
            { key: 'proxyPort', label: 'setting.proxyPort', type: 'text' },
        ],
    },
];

export default function SettingPage() {
    const { t } = useTranslation();
    const [form, setForm] = useState<Partial<SettingInfo>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);

    useEffect(() => {
        getSettingInfo()
            .then((res) => setForm(res.data))
            .catch(() => undefined)
            .finally(() => setLoading(false));
    }, []);

    const onSave = async (key: keyof SettingInfo, value: string | number) => {
        setSaving(String(key));
        try {
            await updateSetting({ key: String(key), value: String(value) });
            toast.success(t('commons.msg.saveSuccess', '保存成功'));
        } catch {
            toast.error(t('commons.msg.saveFailed', '保存失败'));
        } finally {
            setSaving(null);
        }
    };

    const renderField = (field: SettingField) => {
        const value = form[field.key];
        const stringValue = String(value ?? '');

        switch (field.type) {
            case 'select':
                return (
                    <Select value={stringValue} onValueChange={(v) => onSave(field.key, v ?? '')}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {field.options?.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {t(opt.label, opt.label)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            case 'switch':
                return (
                    <Switch
                        checked={stringValue === 'Enable' || stringValue === 'true' || stringValue === '1'}
                        onCheckedChange={(checked) => onSave(field.key, checked ? 'Enable' : 'Disable')}
                    />
                );
            case 'number':
                return (
                    <Input
                        type="number"
                        value={stringValue}
                        onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        onBlur={() => onSave(field.key, stringValue)}
                    />
                );
            case 'password':
                return (
                    <Input
                        type="password"
                        value={stringValue}
                        onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        onBlur={() => onSave(field.key, stringValue)}
                    />
                );
            default:
                return (
                    <Input
                        value={stringValue}
                        onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                        onBlur={() => onSave(field.key, stringValue)}
                    />
                );
        }
    };

    if (loading) {
        return <div className="p-6">{t('commons.loading', '加载中...')}</div>;
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            {sections.map((section) => (
                <Card key={section.title}>
                    <CardHeader>
                        <CardTitle>{t(section.title, section.title)}</CardTitle>
                        {section.description && <CardDescription>{t(section.description)}</CardDescription>}
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        {section.fields.map((field) => (
                            <div key={field.key} className="flex flex-col gap-2">
                                <Label>{t(field.label, field.key)}</Label>
                                {renderField(field) as ReactNode}
                                {saving === String(field.key) && (
                                    <span className="text-muted-foreground text-xs">{t('commons.saving', '保存中...')}</span>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
