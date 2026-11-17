import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY } from '@/lib/constants';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface NodeRole {
    nodeId: number;
    nodeName: string;
    roleId: number;
    roleName: string;
}

export interface ThemeConfig {
    panelName: string;
    primary: string;
    theme: ThemeMode;
    themeColor: string;
}

interface GlobalState {
    language: string;
    themeConfig: ThemeConfig;
    isLogin: boolean;
    entrance: string;
    isAdmin: boolean;
    permissions: string[];
    masterOnlyPermissions: string[];
    nodeRoles: NodeRole[];
    currentNode: string;
    currentNodeAddr: string;
    isLoading: boolean;
    loadingText: string;
    csrfToken: string;
    isEnterpriseLicensed: boolean;
    isProductPro: boolean;
}

interface GlobalActions {
    setLanguage: (language: string) => void;
    setTheme: (theme: ThemeMode) => void;
    setLogin: (isLogin: boolean) => void;
    setEntrance: (entrance: string) => void;
    setCurrentNode: (node: string, addr?: string) => void;
    setLoading: (isLoading: boolean, loadingText?: string) => void;
    setCsrfToken: (csrfToken: string) => void;
    setEnterpriseLicensed: (value: boolean) => void;
    setProductPro: (value: boolean) => void;
    setAuthInfo: (payload: {
        isAdmin: boolean;
        permissions: string[];
        masterOnlyPermissions?: string[];
        nodeRoles?: NodeRole[];
    }) => void;
    clearAuthInfo: () => void;
}

export type GlobalStore = GlobalState & GlobalActions;

export const useGlobalStore = create<GlobalStore>()(
    persist(
        (set) => ({
            language:
                (typeof window !== 'undefined' && localStorage.getItem(LOCALE_STORAGE_KEY)) || DEFAULT_LOCALE,
            themeConfig: {
                panelName: '',
                primary: '#005eeb',
                theme: 'auto',
                themeColor: '',
            },
            isLogin: false,
            entrance: '',
            isAdmin: false,
            permissions: [],
            masterOnlyPermissions: [],
            nodeRoles: [],
            currentNode: 'local',
            currentNodeAddr: '',
            isLoading: false,
            loadingText: '',
            csrfToken: '',
            isEnterpriseLicensed: false,
            isProductPro: false,
            setLanguage: (language) => set({ language }),
            setTheme: (theme) =>
                set((state) => ({ themeConfig: { ...state.themeConfig, theme } })),
            setLogin: (isLogin) => set({ isLogin }),
            setEntrance: (entrance) => set({ entrance }),
            setCurrentNode: (node, addr) =>
                set((state) => ({
                    currentNode: node,
                    currentNodeAddr: addr ?? state.currentNodeAddr,
                })),
            setLoading: (isLoading, loadingText = '') => set({ isLoading, loadingText }),
            setCsrfToken: (csrfToken) => set({ csrfToken }),
            setEnterpriseLicensed: (isEnterpriseLicensed) => set({ isEnterpriseLicensed }),
            setProductPro: (isProductPro) => set({ isProductPro }),
            setAuthInfo: (payload) =>
                set({
                    isAdmin: !!payload.isAdmin,
                    permissions: payload.permissions || [],
                    masterOnlyPermissions: payload.masterOnlyPermissions || [],
                    nodeRoles: payload.nodeRoles || [],
                }),
            clearAuthInfo: () =>
                set({
                    isAdmin: false,
                    permissions: [],
                    masterOnlyPermissions: [],
                    nodeRoles: [],
                    isLogin: false,
                }),
        }),
        {
            name: 'GlobalState',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                language: state.language,
                themeConfig: state.themeConfig,
                isLogin: state.isLogin,
                entrance: state.entrance,
                currentNode: state.currentNode,
                currentNodeAddr: state.currentNodeAddr,
            }),
        },
    ),
);

export const selectIsNodeAdmin = (state: GlobalStore) =>
    state.nodeRoles.some((item) => item.nodeName === state.currentNode && item.roleName === 'Node Admin');

export const selectIsMaster = (state: GlobalStore) => state.currentNode === 'local';
