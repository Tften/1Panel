import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { getPublicFileShareInfo, checkFileShare } from '@/api/share';

export default function SharePage() {
    const { t } = useTranslation();
    const { code } = useParams();
    const [info, setInfo] = useState<{ fileName: string; expiresAt: number; permanent: boolean; hasPassword: boolean } | null>(null);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [unlocked, setUnlocked] = useState(false);

    useEffect(() => {
        if (!code) return;
        getPublicFileShareInfo(code)
            .then((res) => setInfo(res.data))
            .catch((error) => toast.error(String(error)))
            .finally(() => setLoading(false));
    }, [code]);

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        try {
            await checkFileShare({ code: code!, password });
            setUnlocked(true);
            toast.success(t('share.unlocked', '验证成功'));
        } catch (error) { toast.error(String(error)); }
    };

    if (loading) return <Skeleton className="m-6 h-64 w-full" />;
    if (!info) return <div className="p-6">{t('share.notFound', '分享不存在或已过期')}</div>;

    return (
        <div className="flex min-h-svh items-center justify-center bg-muted p-6">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>{t('share.title', '文件分享')}</CardTitle>
                    <CardDescription>{info.fileName}</CardDescription>
                </CardHeader>
                <CardContent>
                    {info.hasPassword && !unlocked ? (
                        <form onSubmit={onSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="password">{t('share.password', '访问密码')}</Label>
                                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                            <Button type="submit">{t('share.unlock', '验证')}</Button>
                        </form>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <p className="text-muted-foreground text-sm">{info.permanent ? t('share.permanent', '永久有效') : t('share.expires', '过期时间') + ': ' + new Date(info.expiresAt).toLocaleString()}</p>
                            <a href={`/api/v2/files/share/download?code=${code}${password ? `&password=${encodeURIComponent(password)}` : ''}`} target="_blank" rel="noreferrer">
                                <Button>{t('share.download', '下载文件')}</Button>
                            </a>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
