import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { EncryptionService } from '../encryption/encryption.service';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  constructor(
    private encryptionService: EncryptionService
  ) { }

  async get(): Promise<HttpHeaders> {
    const encryptedType = sessionStorage.getItem('api-token');
    const ivType = sessionStorage.getItem('iv-token');
    let token = '';

    if (encryptedType && ivType) {
      // Convert Base64 strings to Uint8Array
      const encryptedTypeArray = this.encryptionService.base64ToUint8Array(encryptedType);
      const ivTypeArray = this.encryptionService.base64ToUint8Array(ivType);

      // Decrypt using EncryptionService
      try {
        token = await this.encryptionService.decrypt(encryptedTypeArray, ivTypeArray);
      } catch (error) {
        console.error('Decryption failed:', error);
        // Handle decryption error if needed
      }
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }
}
