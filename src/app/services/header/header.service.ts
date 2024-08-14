import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { EncryptionService } from '../encryption/encryption.service';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  constructor(private es: EncryptionService) { }
  
  public get() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + this.es.decryptData(sessionStorage.getItem('api-token') || '')
    });

    return headers;
  }
}
