import CryptoJS from 'crypto-js';
import JSEncrypt from 'jsencrypt';

export const getCookie = (name: string): string | undefined => {
    if (typeof document === 'undefined') return undefined;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
};

const rsaEncrypt = (data: string, publicKey: string): string | false => {
    if (!data) return data;
    const jsEncrypt = new JSEncrypt();
    jsEncrypt.setPublicKey(publicKey);
    return jsEncrypt.encrypt(data);
};

const aesEncrypt = (data: string, key: string): string => {
    const keyBytes = CryptoJS.enc.Utf8.parse(key);
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(data, keyBytes, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    return iv.toString(CryptoJS.enc.Base64) + ':' + encrypted.toString();
};

const urlDecode = (value: string): string => decodeURIComponent(value.replace(/\+/g, ' '));

const generateAESKey = (): string => {
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);
    return Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
};

export const encryptPassword = (password: string): string => {
    if (!password) return '';
    let publicKeyText = getCookie('panel_public_key');
    if (!publicKeyText) return password;
    publicKeyText = urlDecode(publicKeyText).replaceAll('"', '');
    const publicKey = atob(publicKeyText);
    const aesKey = generateAESKey();
    const keyCipher = rsaEncrypt(aesKey, publicKey);
    const passwordCipher = aesEncrypt(password, aesKey);
    return `${keyCipher}:${passwordCipher}`;
};

export const encodeBase64 = (value: string): string => {
    return btoa(unescape(encodeURIComponent(value)));
};
