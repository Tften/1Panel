import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY } from '@/lib/constants';

type LocaleMessage = Record<string, unknown>;
type LocaleLoader = () => Promise<{ default: LocaleMessage }>;

const LOCALE_LOADERS: Record<string, LocaleLoader> = {
    zh: () => import('./modules/zh'),
    'zh-Hant': () => import('./modules/zh-Hant'),
    en: () => import('./modules/en'),
    'pt-BR': () => import('./modules/pt-br'),
    ja: () => import('./modules/ja'),
    ru: () => import('./modules/ru'),
    ms: () => import('./modules/ms'),
    ko: () => import('./modules/ko'),
    lo: () => import('./modules/lo'),
    tr: () => import('./modules/tr'),
    fa: () => import('./modules/fa'),
    'es-ES': () => import('./modules/es-es'),
};

const loadedLocales = new Set<string>();

export const getStoredLocale = (): string => {
    if (typeof window === 'undefined') return DEFAULT_LOCALE;
    return localStorage.getItem(LOCALE_STORAGE_KEY) || DEFAULT_LOCALE;
};

export const loadLocaleMessages = async (locale: string): Promise<string> => {
    const target = LOCALE_LOADERS[locale] ? locale : DEFAULT_LOCALE;
    if (loadedLocales.has(target)) return target;
    const loader = LOCALE_LOADERS[target];
    if (!loader) return target;
    const mod = await loader();
    i18n.addResourceBundle(target, 'translation', mod.default || {}, true, true);
    loadedLocales.add(target);
    return target;
};

export const setActiveLocale = async (locale: string): Promise<string> => {
    const loaded = await loadLocaleMessages(locale);
    await i18n.changeLanguage(loaded);
    if (typeof window !== 'undefined') {
        localStorage.setItem(LOCALE_STORAGE_KEY, loaded);
    }
    return loaded;
};

export const initI18n = async (): Promise<string> => {
    const initial = getStoredLocale();
    await i18n.use(initReactI18next).init({
        lng: initial,
        fallbackLng: DEFAULT_LOCALE,
        interpolation: { escapeValue: false },
        returnEmptyString: false,
    });
    await loadLocaleMessages(initial);
    if (initial !== DEFAULT_LOCALE) {
        await loadLocaleMessages(DEFAULT_LOCALE);
    }
    await i18n.changeLanguage(initial);
    return initial;
};

export { LOCALE_LOADERS };
export default i18n;
