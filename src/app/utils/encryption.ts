function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}
  
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}
  
const appKeyBase64 = 't+V/1rAfBtQU6k8/mHlgdtZYefZ2gtrQqhKjJKXe5Qs=';  // Your APP_KEY (base64)
const ivBase64 = 'base64_encoded_iv'; // Replace with actual base64-encoded IV

const secretKey = base64ToArrayBuffer(appKeyBase64);
const iv = base64ToArrayBuffer(ivBase64);  // Ensure this is 16 bytes for AES-CBC

export async function encryptData(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    secretKey,
    { name: 'AES-CBC' },
    false,
    ['encrypt']
  );

  const encodedData = new TextEncoder().encode(data);
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv: iv },
    key,
    encodedData
  );

  return arrayBufferToBase64(encryptedData);
}

export async function decryptData(ciphertextBase64: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    secretKey,
    { name: 'AES-CBC' },
    false,
    ['decrypt']
  );

  const ciphertext = base64ToArrayBuffer(ciphertextBase64);
  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv: iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decryptedData);
}

// Usage Example
// (async () => {
//   const data = 'Hello, World!';
//   const encrypted = await encryptData(data);
//   console.log('Encrypted:', encrypted);

//   const decrypted = await decryptData(encrypted);
//   console.log('Decrypted:', decrypted);
// })();
