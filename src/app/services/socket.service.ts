  import { Injectable } from '@angular/core';
  import { io } from 'socket.io-client';
  import { Observable, Subject } from 'rxjs';
  import { environment } from 'src/environments/environment';

  @Injectable({
    providedIn: 'root',
  })
  export class SocketService {
    private socket: any;
    private selectedDriver: any; 
    private apiUrl = environment.apiUrl;
   public assignedDriver: any;
    constructor() {
     
    }
    createSocket(): void {
      this.socket = io('http://localhost:8000');
      
      this.socket.on('connect', () => {
        console.log('Socket connected!');   
      });

      this.socket.on('assignDriver', (data: any) => {
       
        this.assignedDriver=data;
      });

      this.socket.on('holdCompleted', (data: any) => {
        // console.log("Received hold event:", data);
        
      });

      this.socket.on('error', (error: any) => {
        console.error('Socket error:', error);
      });
    }
    
    emitEvent(eventName: string, data: any): void {
      // console.log("hiiii emit eventtttttttttttt",eventName+data)
      this.socket.emit(eventName, data);
    }
  
    listenToEvent(eventName: string): Observable<any> {
      // console.log(`Listening to event: ${eventName}`);
      return new Observable((subscriber) => {
        this.socket.on(eventName, (data: any) => {
          // console.log("Inside listentievent data",data)
          subscriber.next(data);
        });
      });
    }
  }
