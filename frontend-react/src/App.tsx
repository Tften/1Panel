import { useEffect, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { useGlobalStore } from '@/store/global';
import { applyTheme, ensureSystemThemeListener } from '@/lib/theme';
import { setRedirectHandler, type AuthRedirect } from '@/lib/http';
import LoginPage from '@/pages/login';
import HomePage from '@/pages/home';

function RequireAuth({ children }: { children: ReactNode }) {
    const isLogin = useGlobalStore((s) => s.isLogin);
    const entrance = useGlobalStore((s) => s.entrance);
    if (!isLogin) {
        return <Navigate to={entrance ? `/entrance/${entrance}` : '/login'} replace />;
    }
    return <>{children}</>;
}

function RedirectBridge() {
    const navigate = useNavigate();
    useEffect(() => {
        setRedirectHandler((redirect: AuthRedirect) => {
            switch (redirect.type) {
                case 'entrance':
                    navigate(redirect.entrance ? `/entrance/${redirect.entrance}` : '/login', { replace: true });
                    break;
                case 'expired':
                    navigate('/expired', { replace: true });
                    break;
                case 'enterprise-license':
                    navigate('/license', { replace: true });
                    break;
                default:
                    break;
            }
        });
        return () => setRedirectHandler(undefined);
    }, [navigate]);
    return null;
}

export default function App() {
    useEffect(() => {
        applyTheme();
        ensureSystemThemeListener();
    }, []);

    return (
        <BrowserRouter>
            <RedirectBridge />
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/entrance/:code" element={<LoginPage />} />
                <Route path="/expired" element={<div className="p-8">会话已过期，请重新登录。</div>} />
                <Route
                    path="/"
                    element={
                        <RequireAuth>
                            <HomePage />
                        </RequireAuth>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster />
        </BrowserRouter>
    );
}
