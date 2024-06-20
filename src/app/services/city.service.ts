import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CityService {
 
  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}

  addCity(cityData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/pricing/city`, cityData);
  }

  fetchCountries(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pricing/country`);
  }

  getAllCitiesByCountry(countryid: string): Observable<any[]> {
    const params = new HttpParams().set('countryid', countryid);
    return this.http.get<any[]>(`${this.apiUrl}/pricing/city`, { params });
  }
  
  editZone(id: string, cityData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/pricing/city/${id}`, cityData);
  }

}
