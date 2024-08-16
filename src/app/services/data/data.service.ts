import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HeaderService } from '../header/header.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private http: HttpClient,
    private header: HeaderService
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

  public request(method: string, url: string, form: any) {
    switch(method) {
      case 'GET':
        return this.http.get(this.apiUrl + url, { headers: this.header.get() });

      case 'POST':
        return this.http.post(this.apiUrl + url, form, { headers: this.header.get() });

      case 'PUT':
        return this.http.put(this.apiUrl + url, form, { headers: this.header.get() });
      
      case 'DELETE':
        return this.http.delete(this.apiUrl + url, { headers: this.header.get() });

      default:
        throw new Error(`Unsupported request method: ${method}`);
    }
  }
}
