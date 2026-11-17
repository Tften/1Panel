import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { logOutApi } from '@/api/auth';
import { useGlobalStore } from '@/store/global';
import { setTheme } from '@/lib/theme';
import { setActiveLocale } from '@/i18n';

export default function HomePage() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const clearAuthInfo = useGlobalStore((s) => s.clearAuthInfo);
    const entrance = useGlobalStore((s) => s.entrance);
    const isAdmin = useGlobalStore((s) => s.isAdmin);
    const theme = useGlobalStore((s) => s.themeConfig.theme);

    const onLogout = async () => {
        try {
            await logOutApi();
        } finally {
            clearAuthInfo();
            navigate(entrance ? `/entrance/${entrance}` : '/login', { replace: true });
        }
    };

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-8">
            <h1 className="text-2xl font-semibold">1Panel · React 骨架</h1>
            <p className="text-muted-foreground">
                {t('commons.login.login', '登录')} · {isAdmin ? 'ADMIN' : 'USER'} · lang={i18n.language}
            </p>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    theme: {theme}
                </Button>
                <Button variant="outline" onClick={() => setActiveLocale(i18n.language === 'zh' ? 'en' : 'zh')}>
                    lang: {i18n.language}
                </Button>
                <Button onClick={onLogout}>{t('commons.login.logout', '退出登录')}</Button>
            </div>
        </div>
    );
}
