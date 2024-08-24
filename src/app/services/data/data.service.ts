import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { HeaderService } from '../header/header.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private http: HttpClient,
    private hd: HeaderService
  ) { }

  private apiUrl = 'http://localhost:8000/api/';

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
    
    if(['POST', 'PUT'].includes(method) && !form) { throw new Error(`Form is required for method ${method}`); }

    switch(method) {
      case 'GET':
        return this.http.get(this.apiUrl + url, { withCredentials: true });

      case 'POST':
        return this.http.post(this.apiUrl + url, form, { withCredentials: true });

      case 'PUT':
        form.append('_method', 'PUT');
        return this.http.post(this.apiUrl + url, form, { withCredentials: true });
      
      case 'DELETE':
        return this.http.delete(this.apiUrl + url, { withCredentials: true });

      default:
        throw new Error(`Unsupported request method: ${method}`);
    }
  }
}
