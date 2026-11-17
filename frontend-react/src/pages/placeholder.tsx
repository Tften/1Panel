import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function PlaceholderPage() {
    const { t } = useTranslation();
    const params = useParams();
    const path = location.pathname;
    const routeName = params['*'] || path;

    return (
        <div className="flex flex-col gap-4 p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Construction className="size-5" />
                        {t('commons.placeholder.title', '页面迁移中')}
                    </CardTitle>
                    <CardDescription>
                        {t('commons.placeholder.desc', '该页面正在迁移至 React + shadcn/ui')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">
                        {t('commons.placeholder.path', '当前路径')}: <code className="bg-muted rounded px-1">{routeName}</code>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
