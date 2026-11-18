import { http } from '@/lib/http';

export interface SettingInfo {
    systemVersion: string;
    upgradeBackupCopies: string;
    developerMode: string;
    sessionTimeout: number;
    expirationDays: number;
    panelName: string;
    edition: string;
    theme: string;
    menuTabs: string;
    menuAccordion: string;
    panelCache: string;
    language: string;
    docSource: string;
    serverPort: number;
    ipv6: string;
    bindAddress: string;
    ssl: string;
    sslType: string;
    allowIPs: string;
    allowIPTrustedProxies: string;
    bindDomain: string;
    passkeyTrustedProxies: string;
    securityEntrance: string;
    dashboardMemoVisible: string;
    dashboardSimpleNodeVisible: string;
    complexityVerification: string;
    messageType: string;
    emailVars: string;
    weChatVars: string;
    dingVars: string;
    snapshotIgnore: string;
    hideMenu: string;
    noAuthSetting: string;
    proxyUrl: string;
    proxyType: string;
    proxyPort: string;
    proxyUser: string;
    proxyPasswd: string;
    proxyPasswdKeep: string;
}

export interface SettingUpdate {
    key: string;
    value: string;
}

export const getSettingInfo = () => http.post<SettingInfo>('/core/settings/search');
export const updateSetting = (param: SettingUpdate) => http.post('/core/settings/update', param);

export const getSettingBaseInfo = () =>
    http.post<{ systemVersion: string; developerMode: string }>('/core/settings/search/base');

export const loadUpgradeInfo = () =>
    http.get<{ latestVersion: string; newVersion: boolean; releaseNotes: string }>('/core/settings/upgrade');
