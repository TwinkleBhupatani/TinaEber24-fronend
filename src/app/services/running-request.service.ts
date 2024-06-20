import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RunningRequestservice {
  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}


getSeconds(): Observable<any>
{
  return this.http.get<any>(`${this.apiUrl}/drivers/running-request/seconds`); 
}

getAssignedDrivers(): Observable<any>
{
  const params = new HttpParams()
  .set('status', "Sending")
  return this.http.get<any[]>(`${this.apiUrl}/rides/create-ride`,{params}); 
}

}  