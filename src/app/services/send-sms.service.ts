import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SendSmsService {
  private apiUrl = environment.apiUrl;
 
  constructor(private http: HttpClient) {}

  sendSms(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/send-sms`, formData);
  } 
}  