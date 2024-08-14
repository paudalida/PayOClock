import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  constructor() { }

  private BASE64_KEY = 't+V/1rAfBtQU6k8/mHlgdtZYefZ2gtrQqhKjJKXe5Qs=';
  private SECRET_KEY = CryptoJS.enc.Base64.parse(this.BASE64_KEY);

  // Encrypt data
  encryptData(data: string): string {
    return CryptoJS.AES.encrypt(data, this.SECRET_KEY).toString();
  }

  // Decrypt data
  decryptData(encryptedData?: string): string {
    if(encryptedData) {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } else {
      return '';
    }
  }
}
