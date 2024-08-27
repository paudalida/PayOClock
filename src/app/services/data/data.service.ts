import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private http: HttpClient
  ) { }

  private apiUrl = 'http://localhost:8000/api/';
  private httpHeaders = new HttpHeaders({
    Authorization:  `Bearer ${sessionStorage.getItem('auth-token') || 'sgfadfsd'}`
  });

  /* 
    ## USAGE

    -- Subscribe to request and input params
    -- Adds the headers from header service

    ## Params
    
    **method**: Http method to be used
    **url**: URL endpoint appended to the apiUrl variable
    **form**: Form values to be sent to the server
  */

  public request(method: string, url: string, form?: any) {

    switch(method) {
      case 'GET':
        return this.http.get(this.apiUrl + url, {headers: this.httpHeaders});

      case 'POST':
        return this.http.post(this.apiUrl + url, form, {headers: this.httpHeaders});

      case 'PUT':
        form.append('_method', 'PUT');
        return this.http.post(this.apiUrl + url, form, {headers: this.httpHeaders});
      
      case 'DELETE':
        return this.http.delete(this.apiUrl + url, {headers: this.httpHeaders});

      default:
        throw new Error(`Unsupported request method: ${method}`);
    }
  }
}
