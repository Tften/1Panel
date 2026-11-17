import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { initI18n } from '@/i18n';
import { useGlobalStore } from '@/store/global';

initI18n().then((locale) => {
    useGlobalStore.getState().setLanguage(locale);
    createRoot(document.getElementById('root')!).render(
        <StrictMode>
            <App />
        </StrictMode>,
    );
});
