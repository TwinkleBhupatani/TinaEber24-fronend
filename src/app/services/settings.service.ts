import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SettinsService {
  private apiUrl = environment.apiUrl;
 
  constructor(private http: HttpClient) {}

  addSettings(vehiclePriceData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/settings`, vehiclePriceData);
  } 

}  