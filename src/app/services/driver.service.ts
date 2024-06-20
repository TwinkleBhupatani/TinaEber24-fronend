import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DriverAssignmentService {
  private driverAssignedSubject = new Subject<string>();

  driverAssigned$ = this.driverAssignedSubject.asObservable();

  constructor() { }

  notifyDriverAssigned(assignedDriver: any) {
    console.log("service",assignedDriver)
    this.driverAssignedSubject.next(assignedDriver);
  }
}