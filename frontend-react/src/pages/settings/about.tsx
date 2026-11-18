import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGlobalStore } from '@/store/global';

export default function AboutPage() {
    const { t } = useTranslation();
    const systemVersion = useGlobalStore((s) => s.themeConfig.panelName);

    return (
        <div className="flex flex-col gap-4 p-6">
            <h1 className="text-2xl font-bold">{t('setting.about', '关于')}</h1>
            <Card>
                <CardHeader>
                    <CardTitle>1Panel</CardTitle>
                    <CardDescription>{t('about.description', '现代化、开源的 Linux 服务器运维管理面板')}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('about.version', '版本')}</span>
                        <span>{systemVersion || 'v2.0.0'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('about.website', '官网')}</span>
                        <a href="https://1panel.cn" target="_blank" rel="noreferrer" className="text-primary hover:underline">1panel.cn</a>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('about.docs', '文档')}</span>
                        <a href="https://1panel.pro/docs" target="_blank" rel="noreferrer" className="text-primary hover:underline">1panel.pro/docs</a>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('about.github', 'GitHub')}</span>
                        <a href="https://github.com/1Panel-dev/1Panel" target="_blank" rel="noreferrer" className="text-primary hover:underline">github.com/1Panel-dev/1Panel</a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
