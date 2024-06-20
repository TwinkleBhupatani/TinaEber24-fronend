import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VehicleTypeService {
  private apiUrl = environment.apiUrl;
  
 
  constructor(private http: HttpClient) {}

  addVehicleType(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/pricing/vehicle-type`, formData);
  } 
  getVehicleTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pricing/vehicle-type`);
  }
  editVehicleType(id: string, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/pricing/vehicle-type/${id}`, formData);
  }
}  