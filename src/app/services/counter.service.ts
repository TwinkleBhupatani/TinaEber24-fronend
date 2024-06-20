import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })
  export class CounterService {
    private counterKey = 'myAppCounter';
    private counterSubject: BehaviorSubject<number>;
  
    constructor() { 
      this.counterSubject = new BehaviorSubject<number>(this.getCounter());
    }
  
    getCounter(): number {
    
      return parseInt(localStorage.getItem(this.counterKey) || '0', 10);
    }
  
    getCounterObservable(): Observable<number> {
      return this.counterSubject.asObservable();
    }

    setCounter(value: number): void {
      console.log(value.toString())
      localStorage.setItem(this.counterKey, value.toString());
      this.counterSubject.next(value);
    }
  
    incrementCounter(): void {
      const counter = this.getCounter() + 1;
      this.setCounter(counter);
    }
  
    decrementCounter(): void {
      const counter = this.getCounter() - 1;
      this.setCounter(counter);
    }
  }
  