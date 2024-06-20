import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private apiUrl = environment.apiUrl;
  private countryApiUrl = environment.countryApiUrl;
  constructor(private http: HttpClient) {}

  getCountries(): Observable<any[]> {
    return this.http.get<any[]>(this.countryApiUrl);
  }

  addCountry(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/pricing/country`, formData);
  }

  getAllCountries(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pricing/country`);
  }

  searchCountry(searchTerm: string): Observable<any[]> {
    const params = new HttpParams().set('search', searchTerm);
    return this.http.get<any[]>(`${this.apiUrl}/pricing/country/search`, { params });
  }
}
