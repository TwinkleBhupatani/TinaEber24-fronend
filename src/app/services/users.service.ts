import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = environment.apiUrl;
 
  constructor(private http: HttpClient) {}


  addUser(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users`, formData);
  } 

  getUsers(searchText: string, sortTerm: string, page: number, pageSize: number): Observable<any> {
    const params = new HttpParams()
      .set('search', searchText)
      .set('sort', sortTerm)
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
  
    return this.http.get(`${this.apiUrl}/users`, { params });
  }

  getCCCode(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pricing/country`);
  }

  editUser(id: string, formData: FormData): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${id}`, formData);
  }

  deleteUser(id: string): Observable<any>
  {
    return this.http.delete<any>(`${this.apiUrl}/users/delete/${id}`);
  }

  getPublishKey(): Observable<any>
  {
    return this.http.get<any>(`${this.apiUrl}/settings/publish-key`);
  }
  addCard(cardData: any, id: string)
  {
    return this.http.post<any>(`${this.apiUrl}/users/add-card/${id}`, cardData);
  }

  getCards(id: string)
  {
    return this.http.get<any[]>(`${this.apiUrl}/users/get-cards/${id}`);
  }

  deleteCard(userId: string, cardId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/users/delete-card/${userId}/${cardId}`);
  }
  
  setDefaultCard(cardId: string, userId: string): Observable<any> {
    const url = `${this.apiUrl}/users/set-default-card/${userId}/${cardId}`;
    return this.http.put(url, {});
  }

}  