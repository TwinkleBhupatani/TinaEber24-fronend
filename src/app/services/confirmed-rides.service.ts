import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ConfirmedRidesService {
  private apiUrl = environment.apiUrl;
 
  constructor(private http: HttpClient) {}

  getCreatedRides(searchByType: string,searchByName: string, searchByNumber: string, searchById: string, searchByDate: string,searchByStatus: string, searchBySource: string, searchByDestination: string,searchByKey: string, flag: boolean): Observable<any> {
    const params = new HttpParams()
    .set('type', searchByType)
    .set('name', searchByName)
    .set('number', searchByNumber)
    .set('id', searchById)
    .set('date', searchByDate)
    .set('status', searchByStatus)
    .set('source',searchBySource)
    .set('destination', searchByDestination)
    .set('keyword',searchByKey)
    .set('flag',flag);
    return this.http.get<any[]>(`${this.apiUrl}/rides/create-ride`,{ params });
  } 

  getAvailableDrivers(source: any, vtype: any): Observable<any>
  {
   
    const params = new HttpParams()
    .set('source', source)
    .set('vtype', vtype);
    return this.http.get<any[]>(`${this.apiUrl}/rides/confirmed-ride/get-available-drivers`,{params});
  }

  updateRide(rideId: string, status: string, driverid: string, assignedDrivers: any,assignAnyAvailable: boolean): Observable<any> {
   
    if(!assignAnyAvailable)
      {
        const updateData = { status, driverid, assignedDrivers,assignAnyAvailable };
       
        return this.http.put(`${this.apiUrl}/rides/create-ride/${rideId}`, updateData);
      }
      else if(assignAnyAvailable && status!=='Sending')
        {
          const updateData = { status, driverid, assignedDrivers,assignAnyAvailable };
          return this.http.put(`${this.apiUrl}/rides/create-ride/${rideId}`, updateData);
        }
    else{
      return this.http.get<any>(`${this.apiUrl}/confirmed-rides/started`)
    }
   
    
  }
 
  getAnyAvailableDrivers(rideId: any, assignAnyAvailable: boolean): Observable<any>
  {
    const params = new HttpParams()
    .set('rideId', rideId)
    .set('assignAnyAvailable', assignAnyAvailable);
    return this.http.get<any[]>(`${this.apiUrl}/rides/confirmed-ride/get-any-available-drivers`,{params});
  }

  sendEmailCompleted(formData: FormData): Observable<any> {
 
    return this.http.post<any>(`${this.apiUrl}/send-email/ride-compelted`, formData);
  } 

  driverStarted():Observable<any>
  {
    return this.http.get<any>(`${this.apiUrl}/confirmed-rides/started`)
  }

  makePayment(userid: String, estimateFare: String):Observable<any>
  {
    return this.http.get<any>(`${this.apiUrl}/confirmed-rides/complted/make-payment/${userid}/${estimateFare}`)
  }
}  