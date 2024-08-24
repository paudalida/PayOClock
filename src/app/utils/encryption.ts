// Generate a key for AES encryption
async function generateKey() {
  return await crypto.subtle.generateKey(
      {
          name: "AES-CBC",
          length: 256,  // AES-256
      },
      true,
      ["encrypt", "decrypt"]
  );
}

// Encrypt function
async function encrypt(text: any, key: any) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  const iv = crypto.getRandomValues(new Uint8Array(16));  // Generate a random IV
  
  const encrypted = await crypto.subtle.encrypt(
      {
          name: "AES-CBC",
          iv: iv,
      },
      key,
      data
  );
  
  return { iv, encryptedData: encrypted };
}

// Decrypt function
async function decrypt(encryptedData: any, key: any, iv: any) {
  const decrypted = await crypto.subtle.decrypt(
      {
          name: "AES-CBC",
          iv: iv,
      },
      key,
      encryptedData
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

// Example usage
(async () => {
  const key = await generateKey();
  
  const { iv, encryptedData } = await encrypt("Hello World", key);
  
  const decryptedText = await decrypt(encryptedData, key, iv);
  
  console.log(decryptedText);  // Outputs: Hello World
})();


// function base64ToArrayBuffer(base64: string): ArrayBuffer {
//   if (typeof window !== 'undefined') {
//     const binaryString = window.atob(base64);
//     const len = binaryString.length;
//     const bytes = new Uint8Array(len);
//     for (let i = 0; i < len; i++) {
//       bytes[i] = binaryString.charCodeAt(i);
//     }
//     return bytes.buffer;
//   } else {
//     throw new Error('window is not defined');
//   }
// }

// function arrayBufferToBase64(buffer: ArrayBuffer): string {
//   if (typeof window !== 'undefined') {
//     const bytes = new Uint8Array(buffer);
//     let binary = '';
//     let len = bytes.byteLength;
//     for (let i = 0; i < len; i++) {
//       binary += String.fromCharCode(bytes[i]);
//     }
//     return window.btoa(binary);
//   } else {
//     throw new Error('window is not defined');
//   }
// }

// const appKeyBase64 = 't+V/1rAfBtQU6k8/mHlgdtZYefZ2gtrQqhKjJKXe5Qs=';  // Your APP_KEY (base64)
// const secretKey = base64ToArrayBuffer(appKeyBase64);

// export async function encryptData(data: string): Promise<string> {
//   if (typeof window !== 'undefined') {
//     const key = await crypto.subtle.importKey(
//       'raw',
//       secretKey,
//       { name: 'AES-GCM' },
//       false,
//       ['encrypt']
//     );

//     // Generate a random 12-byte IV for AES-GCM
//     const iv = window.crypto.getRandomValues(new Uint8Array(12));

//     const encodedData = new TextEncoder().encode(data);
//     const encryptedData = await crypto.subtle.encrypt(
//       { name: 'AES-GCM', iv: iv },
//       key,
//       encodedData
//     );

//     // Prepend the IV to the encrypted data
//     const combinedData = new Uint8Array(iv.length + encryptedData.byteLength);
//     combinedData.set(iv);
//     combinedData.set(new Uint8Array(encryptedData), iv.length);

//     return arrayBufferToBase64(combinedData.buffer);
//   } else {
//     throw new Error('window is not defined');
//   }
// }

// export async function decryptData(ciphertextBase64: string): Promise<string> {
//   if (typeof window !== 'undefined') {
//     const key = await crypto.subtle.importKey(
//       'raw',
//       secretKey,
//       { name: 'AES-GCM' },
//       false,
//       ['decrypt']
//     );

//     // Decode base64 and extract IV and ciphertext
//     const combinedData = new Uint8Array(base64ToArrayBuffer(ciphertextBase64));

//     // The first 12 bytes are the IV, the rest is the ciphertext
//     const iv = combinedData.slice(0, 12);  // Extract IV
//     const ciphertext = combinedData.slice(12);  // Extract ciphertext

//     const decryptedData = await crypto.subtle.decrypt(
//       { name: 'AES-GCM', iv: iv },
//       key,
//       ciphertext
//     );

//     return new TextDecoder().decode(decryptedData);
//   } else {
//     throw new Error('window is not defined');
//   }
// }


// // Usage Example
// // (async () => {
// //   const data = 'Hello, World!';
// //   const encrypted = await encryptData(data);
// //   console.log('Encrypted:', encrypted);

// //   const decrypted = await decryptData(encrypted);
// //   console.log('Decrypted:', decrypted);
// // })();
