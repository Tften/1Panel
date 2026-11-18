import { useEffect, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useGlobalStore } from '@/store/global';
import { applyTheme, ensureSystemThemeListener } from '@/lib/theme';
import { setRedirectHandler, setErrorHandler, setReloadHandler, type AuthRedirect } from '@/lib/http';
import { AppLayout } from '@/components/layout';
import LoginPage from '@/pages/login';
import HomePage from '@/pages/home';
import PlaceholderPage from '@/pages/placeholder';
import SettingPage from '@/pages/settings/panel';
import LicensePage from '@/pages/settings/license';
import BackupAccountsPage from '@/pages/settings/backup-accounts';
import SnapshotPage from '@/pages/settings/snapshot';
import AboutPage from '@/pages/settings/about';
import SharePage from '@/pages/share/index';
import APIKeysPage from '@/pages/settings/api-keys';
import AppStorePage from '@/pages/apps/index';
import AppDetailPage from '@/pages/apps/detail';
import AppInstalledPage from '@/pages/apps/installed';
import WebsitePage from '@/pages/websites/index';
import WebsiteCreatePage from '@/pages/websites/create';
import RuntimePage from '@/pages/websites/runtime';
import SSLPage from '@/pages/websites/ssl';
import MysqlPage from '@/pages/databases/mysql';
import PostgresqlPage from '@/pages/databases/postgresql';
import MongodbPage from '@/pages/databases/mongodb';
import RedisPage from '@/pages/databases/redis';
import ContainerPage from '@/pages/containers/index';
import ContainerResourcePage from '@/pages/containers/resource';
import FileManagerPage from '@/pages/files/index';
import MonitorPage from '@/pages/host/monitor';
import HostSubPage from '@/pages/host/sub';
import CronjobPage from '@/pages/cronjobs/index';
import LogPage from '@/pages/logs/index';
import AIPage from '@/pages/ai/index';
import MCPPage from '@/pages/ai/mcp';
import AgentsPage from '@/pages/ai/agents';
import McpServerPage from '@/pages/ai/mcp-servers';
import TerminalPage from '@/pages/terminal/index';
import ToolboxPage from '@/pages/toolbox/index';
import VMPage from '@/pages/vm/index';
import ExampleExtensionPage from '@/pages/extensions/example';
import { extensionRoutes } from '@/extensions/routes';
import { modules } from '@/router/modules';
import type { AppRoute } from '@/router/types';

function RequireAuth({ children }: { children: ReactNode }) {
    const isLogin = useGlobalStore((s) => s.isLogin);
    const entrance = useGlobalStore((s) => s.entrance);
    const devBypass = import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH === 'true';
    if (!isLogin && !devBypass) {
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

function renderRoutes(routes: AppRoute[]) {
    return routes.flatMap((route) => {
        const children = route.children ? renderRoutes(route.children) : [];
        if (route.children) {
            return [
                <Route key={route.name} path={route.path} element={<PlaceholderPage />}>
                    {children}
                </Route>,
            ];
        }
        return [<Route key={route.name} path={route.path} element={<PlaceholderPage />} />];
    });
}

export default function App() {
    useEffect(() => {
        applyTheme();
        ensureSystemThemeListener();
        setErrorHandler((message) => {
            toast.error(message);
        });
        setReloadHandler(() => window.location.reload());
        return () => {
            setErrorHandler(undefined);
            setReloadHandler(undefined);
        };
    }, []);

    return (
        <BrowserRouter>
            <RedirectBridge />
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/entrance/:code" element={<LoginPage />} />
                <Route path="/:code" element={<LoginPage />} />
                <Route path="/expired" element={<div className="p-8">会话已过期，请重新登录。</div>} />
                <Route path="/s/:code" element={<SharePage />} />
                <Route
                    path="/"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <HomePage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/settings/*"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <SettingPage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/settings/license"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <LicensePage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/settings/backupaccount"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <BackupAccountsPage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/settings/snapshot"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <SnapshotPage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/settings/about"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <AboutPage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/settings/apikeys"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <APIKeysPage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/apps"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <AppStorePage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/apps/detail/:key"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <AppDetailPage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/apps/installed"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <AppInstalledPage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/websites"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <WebsitePage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/websites/create"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <WebsiteCreatePage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/websites/ssl"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <SSLPage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/websites/runtimes/php"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <RuntimePage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/databases/mysql"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <MysqlPage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/databases/postgresql"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <PostgresqlPage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/databases/mongodb"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <MongodbPage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/databases/redis"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <RedisPage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/containers"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <ContainerPage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/containers/image"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <ContainerResourcePage type="image" />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/containers/network"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <ContainerResourcePage type="network" />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/containers/volume"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <ContainerResourcePage type="volume" />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/containers/compose"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <ContainerResourcePage type="compose" />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/hosts/files"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <FileManagerPage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/hosts/monitor"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <MonitorPage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/hosts/firewall/rules"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <HostSubPage type="firewall" />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/hosts/ssh/ssh"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <HostSubPage type="ssh" />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/hosts/process/process"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <HostSubPage type="process" />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/hosts/disk"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <HostSubPage type="disk" />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/cronjobs"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <CronjobPage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/logs"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <LogPage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/ai/ollama"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <AIPage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/ai/mcp"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <MCPPage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/ai/agents/agent"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <AgentsPage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/ai/mcp/server"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <McpServerPage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/ai/gpu/current"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <AgentsPage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/terminals"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <TerminalPage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/toolbox"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <ToolboxPage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/vms"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <VMPage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="/extensions/example"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <ExampleExtensionPage />
                            </AppLayout>
                        </RequireAuth>
                    }
                />
                <Route
                    path="*"
                    element={
                        <RequireAuth>
                            <AppLayout>
                                <Routes>{renderRoutes([...modules, ...extensionRoutes])}</Routes>
                            </AppLayout>
                        </RequireAuth>
                    }
                />
            </Routes>
            <Toaster />
        </BrowserRouter>
    );
}
