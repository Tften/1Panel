import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginApi, syncAuthInfo } from '@/api/auth';
import { useGlobalStore } from '@/store/global';
import { applyTheme } from '@/lib/theme';

export default function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const params = useParams();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const setLogin = useGlobalStore((s) => s.setLogin);
    const setEntrance = useGlobalStore((s) => s.setEntrance);

    useEffect(() => {
        const code = params.code;
        if (code) setEntrance(code);
        applyTheme();
    }, [params.code, setEntrance]);

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        try {
            const res = await loginApi({
                name,
                password,
                captcha: '',
                captchaID: '',
                authMethod: 'local',
                authSource: 'local',
                language: useGlobalStore.getState().language,
            });
            if (res.data.mfaStatus === 'enable') {
                toast.info('MFA 验证暂未在本阶段实现');
                return;
            }
            setLogin(true);
            await syncAuthInfo();
            navigate('/', { replace: true });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            if (message.toLowerCase().includes('csrf')) {
                toast.error('CSRF 校验失败，请刷新页面重试');
            } else if (message === 'ErrAuth') {
                toast.error('用户名或密码错误');
            } else if (message) {
                toast.error(message);
            } else {
                toast.error('登录失败，请检查网络或安全入口');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-svh items-center justify-center bg-muted p-6">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle>1Panel</CardTitle>
                    <CardDescription>{t('commons.login.login', '登录')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="name">{t('commons.login.username', '用户名')}</Label>
                            <Input
                                id="name"
                                autoComplete="username"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="password">{t('commons.login.password', '密码')}</Label>
                            <Input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" disabled={submitting}>
                            {t('commons.login.login', '登录')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
