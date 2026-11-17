import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Globe, Database, Container, Settings, Terminal, Bot, Wrench, Monitor, AppWindow, FileText, Shield, Server, LogOut, User, Moon, Sun, Languages } from 'lucide-react';
import { createElement, type ComponentType } from 'react';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { modules } from '@/router/modules';
import { useGlobalStore } from '@/store/global';
import { hasRouteAccessWith } from '@/lib/permission';
import { setTheme } from '@/lib/theme';
import { setActiveLocale } from '@/i18n';
import { logOutApi } from '@/api/auth';
import type { AppRoute } from '@/router/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
    'p-home': Home,
    'p-website': Globe,
    'p-ssl-menu': Shield,
    'p-database': Database,
    'p-container': Container,
    'p-setting': Settings,
    'p-terminal': Terminal,
    'p-jiqiren2': Bot,
    'p-toolbox': Wrench,
    'p-monitor': Monitor,
    'p-appstore': AppWindow,
    'p-log': FileText,
    'p-host': Server,
};

function getIcon(name?: string) {
    return iconMap[name || ''] || Globe;
}

function MenuItem({ route, level = 0 }: { route: AppRoute; level?: number }) {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const state = useGlobalStore.getState();
    const hasAccess = hasRouteAccessWith(state, [route.meta || {}]);
    const icon = getIcon(route.meta?.icon);
    const title = route.meta?.title ? t(route.meta.title) : route.name;
    const isActive = location.pathname === route.path || location.pathname.startsWith(route.path + '/');
    const hasChildren = route.children && route.children.length > 0;

    if (!hasAccess) return null;

    if (hasChildren) {
        const firstVisibleChild = route.children!.find((c) => !c.hidden);
        const targetPath = firstVisibleChild?.path || route.path;
        return (
            <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive} tooltip={title} onClick={() => navigate(targetPath)}>
                    {createElement(icon, { className: 'size-4' })}
                    <span>{title}</span>
                </SidebarMenuButton>
                <SidebarMenuSub>
                    {route.children!
                        .filter((child) => !child.hidden)
                        .map((child) => (
                            <MenuItem key={child.name} route={child} level={level + 1} />
                        ))}
                </SidebarMenuSub>
            </SidebarMenuItem>
        );
    }

    if (level > 0) {
        return (
            <SidebarMenuSubItem>
                <SidebarMenuSubButton isActive={isActive} onClick={() => navigate(route.path)}>
                    <span>{title}</span>
                </SidebarMenuSubButton>
            </SidebarMenuSubItem>
        );
    }

    return (
        <SidebarMenuItem>
            <SidebarMenuButton isActive={isActive} onClick={() => navigate(route.path)} tooltip={title}>
                {createElement(icon, { className: 'size-4' })}
                <span>{title}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

export function AppSidebar() {
    const { t } = useTranslation();
    const homeRoute: AppRoute = {
        path: '/',
        name: 'home',
        meta: { title: 'menu.home', icon: 'p-home' },
    };

    return (
        <Sidebar collapsible="icon">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>{t('menu.home', '首页')}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <MenuItem route={homeRoute} />
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>{t('menu.apps', '应用')}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {modules.map((route) => (
                                <MenuItem key={route.name} route={route} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const clearAuthInfo = useGlobalStore((s) => s.clearAuthInfo);
    const entrance = useGlobalStore((s) => s.entrance);
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
        <SidebarProvider>
            <div className="flex min-h-svh w-full">
                <AppSidebar />
                <main className="flex-1">
                    <header className="flex h-12 items-center justify-between border-b px-4">
                        <SidebarTrigger />
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                                {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setActiveLocale(i18n.language === 'zh' ? 'en' : 'zh')}>
                                <Languages className="size-4" />
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>
                                                <User className="size-4" />
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>{t('commons.login.username', '用户')}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={onLogout}>
                                        <LogOut className="mr-2 size-4" />
                                        {t('commons.login.logout', '退出登录')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>
                    <ScrollArea className="h-[calc(100svh-3rem)]">{children}</ScrollArea>
                </main>
            </div>
        </SidebarProvider>
    );
}
