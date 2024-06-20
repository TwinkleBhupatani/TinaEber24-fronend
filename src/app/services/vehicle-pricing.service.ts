import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VehiclePricingService {
  private apiUrl = environment.apiUrl;
 
  constructor(private http: HttpClient) {}

  addVehiclePrice(vehiclePriceData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/pricing/vehicle-pricing`, vehiclePriceData);
  } 

  getVehiclePrices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pricing/vehicle-pricing`);
  }

  getCountryName(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pricing/country`);
  }

  getAllCitiesByCountry(countryid: string): Observable<any[]> {
    const params = new HttpParams().set('countryid', countryid);
    return this.http.get<any[]>(`${this.apiUrl}/pricing/city`, { params });
  }

  getTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pricing/vehicle-type`);
  }

  getTypesByCity(selectedCity : string): Observable<any> {
    const params = new HttpParams().set('selectedCity', selectedCity);
    return this.http.get<any>(`${this.apiUrl}/pricing/vehicle-pricing/types`,{params});
  }
  
}  