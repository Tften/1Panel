import { beforeEach } from 'vitest';
import { useGlobalStore } from '@/store/global';

beforeEach(() => {
    localStorage.clear();
    useGlobalStore.setState({
        language: 'en',
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
    });
});
