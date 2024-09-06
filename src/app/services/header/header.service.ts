import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  constructor() { }
  
  public get authHeader() {
    return new HttpHeaders({
      Authorization:  `Bearer ${sessionStorage.getItem('auth-token') || ''}`
    });
  }
}
