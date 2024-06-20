import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CreateRideService {
  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}

//   addDriver(formData: FormData): Observable<any> {
//     return this.http.post<any>(`${this.apiUrl}/drivers/list`, formData);
//   } 

  getCCCode(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pricing/country`);
  }

 getUserDetailsByNumber(unumber: string): Observable<any>
 {
    return this.http.get<any>(`${this.apiUrl}/rides/create-ride/check/${unumber}`)
 }

getStops(): Observable<any>
{
  return this.http.get<any>(`${this.apiUrl}/rides/create-ride/stops`); 
}
addSettings(vehiclePriceData: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/settings`, vehiclePriceData);
} 

createRide(createRideData: any): Observable<any>
{
  return this.http.post<any>(`${this.apiUrl}/rides/create-ride`, createRideData); 
}

checkCity(latitude: number, longitude: number): Observable<any>
{
  return this.http.get<any>(`${this.apiUrl}/rides/create-ride/check-city/${latitude}/${longitude}`);
}
}  