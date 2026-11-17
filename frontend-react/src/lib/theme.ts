import { useGlobalStore, type ThemeMode } from '@/store/global';

export const resolveTheme = (theme: ThemeMode): 'light' | 'dark' => {
    if (theme !== 'auto') return theme;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
};

export const applyTheme = (): void => {
    const { themeConfig } = useGlobalStore.getState();
    const resolved = resolveTheme(themeConfig.theme);
    document.documentElement.classList.toggle('dark', resolved === 'dark');
    document.documentElement.classList.toggle('light', resolved === 'light');
};

let listenerAttached = false;

export const ensureSystemThemeListener = (): void => {
    if (listenerAttached || typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', () => {
        if (useGlobalStore.getState().themeConfig.theme === 'auto') applyTheme();
    });
    listenerAttached = true;
};

export const setTheme = (theme: ThemeMode): void => {
    useGlobalStore.getState().setTheme(theme);
    applyTheme();
};
