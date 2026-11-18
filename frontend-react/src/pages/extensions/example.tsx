import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ExampleExtensionPage() {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-4 p-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t('extensions.example.title', '扩展示例')}</CardTitle>
                    <CardDescription>
                        {t('extensions.example.desc', '这是一个扩展示例页面，展示如何注册和使用扩展路由')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">
                        {t('extensions.example.content', '你可以在此页面中实现自定义功能')}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
