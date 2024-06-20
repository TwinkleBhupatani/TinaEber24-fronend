import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiUrl = environment.apiUrl;
 
  constructor(private http: HttpClient) {}

  login(id: string, password: string): Observable<any> {

    const data = { id, password };
    return this.http.post(`${this.apiUrl}/login`, data);
  }
}
