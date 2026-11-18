import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getSystemFiles } from '@/api/toolbox';

export default function ToolboxPage() {
    const { t } = useTranslation();
    const [files, setFiles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSystemFiles()
            .then((res) => setFiles(res.data))
            .catch((error) => toast.error(String(error)))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="flex flex-col gap-4 p-6">
            <h1 className="text-2xl font-bold">{t('menu.toolbox', '工具箱')}</h1>

            <Card>
                <CardHeader>
                    <CardTitle>{t('toolbox.systemFiles', '系统文件')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-32 w-full" />
                    ) : (
                        <div className="flex flex-col gap-2">
                            {files.map((file) => (
                                <div key={file} className="rounded border p-2 font-mono text-sm">
                                    {file}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
