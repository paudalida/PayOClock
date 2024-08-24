import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private key: CryptoKey | null = null;

  constructor() { }

  // Generate and store the key
  async generateKeyAndIV() {
    this.key = await crypto.subtle.generateKey(
      { name: "AES-CBC", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  }

  // Encrypt the text
  async encrypt(text: string): Promise<{ iv: Uint8Array, encryptedData: ArrayBuffer }> {
    if (!this.key) {
      throw new Error('Key is not generated.');
    }

    const iv = crypto.getRandomValues(new Uint8Array(16)); // 16-byte IV
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv: iv },
      this.key,
      data
    );

    return { iv, encryptedData };
  }

  // Decrypt the data
  async decrypt(encryptedData: ArrayBuffer, iv: Uint8Array): Promise<string> {
    if (!this.key) {
      throw new Error('Key is not generated.');
    }

    const decryptedData = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv: iv },
      this.key,
      encryptedData
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  }
  
  // Utility method to convert ArrayBuffer to Base64
  arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Utility method to convert Base64 to Uint8Array
  base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
}
