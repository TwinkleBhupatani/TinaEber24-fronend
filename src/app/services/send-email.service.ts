import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SendEmailService {
  private apiUrl = environment.apiUrl;
 
  constructor(private http: HttpClient) {}

  sendEmail(formData: FormData): Observable<any> {
    console.log("form", formData.get("subject"))
    return this.http.post<any>(`${this.apiUrl}/send-email`, formData);
  } 
}  