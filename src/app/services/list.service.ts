import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ListService {
  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}

  addDriver(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/drivers/list`, formData);
  } 

 
  getDrivers(searchText: string, sortTerm: string, page: number, pageSize: number): Observable<any> {
    const params = new HttpParams()
      .set('search', searchText)
      .set('sort', sortTerm)
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
  
    return this.http.get(`${this.apiUrl}/drivers/list`, { params });
  }

  getCCCode(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pricing/country`);
  }

  getCountryId(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pricing/country`);
  }

  getCity(countryid: string): Observable<any[]> {
    const params = new HttpParams().set('countryid', countryid);
    return this.http.get<any[]>(`${this.apiUrl}/pricing/city`, { params });
  }
  
  toggleApproval(driverId: string): Observable<any> {
    return this.http.put( `${this.apiUrl}/drivers/list/${driverId}/toggle-approval`, {});
  }

  getTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pricing/vehicle-type`);
  }

getTypesByCityVehcilePriceSet(driverId: string, dcityid : string): Observable<any[]>{
  const params = new HttpParams().set('driverId', driverId).set('dcityid', dcityid);
  return this.http.get<any[]>(`${this.apiUrl}/drivers/list/getTypesByCityVehcilePriceSet`,{params});
}

  assignType(driverId: string, typeId: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/drivers/list/type/${driverId}`, {typeId} );
  }

  getAssignedType(driverId: string): Observable<any> {
    console.log(driverId)
    return this.http.get(`${this.apiUrl}/drivers/list/type/${driverId}` );
  }


  editDriver(id: string, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/drivers/list/${id}`, formData);
  }

  deleteDriver(id: string): Observable<any>
  {
    return this.http.delete<any>(`${this.apiUrl}/drivers/list/delete/${id}`);
  }

  addBankAccount(bankInfo: any): Observable<any>
  {
    return this.http.post<any>(`${this.apiUrl}/create-bank-account`, bankInfo);
  }
}  