const KEY = '1234567890123456';
const IV = '1234567890123456';

function strToBuffer(str) {
  return new TextEncoder().encode(str);
}

function base64ToBuffer(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const buffer = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer.buffer;
}

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  const binary = bytes.reduce((acc, b) => acc + String.fromCharCode(b), '');
  return btoa(binary);
}

export async function encryptData(data, keyStr = KEY, ivStr = IV) {
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      strToBuffer(keyStr),
      { name: 'AES-CBC' },
      false,
      ['encrypt']
    );

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-CBC', iv: strToBuffer(ivStr) },
      key,
      strToBuffer(JSON.stringify(data))
    );

    return bufferToBase64(encrypted);
  } catch (error) {
    console.error('Encryption failed:', error);
    return null;
  }
}

export async function decryptData(base64Cipher, keyStr = KEY, ivStr = IV) {
  try {
    const key = await crypto.subtle.importKey(
      'raw',
      strToBuffer(keyStr),
      { name: 'AES-CBC' },
      false,
      ['decrypt']
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv: strToBuffer(ivStr) },
      key,
      base64ToBuffer(base64Cipher)
    );

    const decoded = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

// export const encryptAndStore = async (key, value) => {
//   const encrypted = await encryptData(value);
//   if (encrypted) {
//     localStorage.setItem(key, encrypted);
//   }
// };

// export const decryptLocalStorageItem = async (key) => {
//   const encrypted = localStorage.getItem(key);
//   if (!encrypted) return null;
//   try {
//     return await decryptData(encrypted);
//   } catch (error) {
//     console.error(`Decryption failed for key: ${key}`, error);
//     return null;
//   }
// };

export const encryptAndStore = async (key, value) => {
  const encryptedKey = await encryptData(key);
  const encryptedValue = await encryptData(value);
  if (encryptedKey && encryptedValue) {
    localStorage.setItem(encryptedKey, encryptedValue);
  }
};

export const decryptLocalStorageItem = async (key) => {
  const encryptedKey = await encryptData(key);
  if (!encryptedKey) return null;

  const encryptedValue = localStorage.getItem(encryptedKey);
  if (!encryptedValue) return null;

  try {
    return await decryptData(encryptedValue);
  } catch (error) {
    console.error(`Decryption failed for key: ${key}`, error);
    return null;
  }
};