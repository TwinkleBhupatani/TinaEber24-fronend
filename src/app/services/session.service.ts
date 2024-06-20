
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private isLoggedInKey = 'isLoggedIn';
  private sessionTimeout: number = 20 * 60 * 1000; 
  private sessionTimer: any;

  constructor(private router: Router) {
    this.initSession();
    this.resetSessionTimer();
    this.setupStorageEventListener();
  }

  private initSession(): void {
    const storedIsLoggedIn = localStorage.getItem(this.isLoggedInKey);
    if (storedIsLoggedIn === 'true') {
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;
    }
  }

  private set isLoggedIn(value: boolean) {
    localStorage.setItem(this.isLoggedInKey, value.toString());
  }

  private get isLoggedIn(): boolean {
    return localStorage.getItem(this.isLoggedInKey) === 'true';
  }

  login(): void {
    this.isLoggedIn = true;
    this.resetSessionTimer();
    this.broadcastLoginEvent();
  }

  logout(): void {
    this.isLoggedIn = false;
    clearTimeout(this.sessionTimer);
    this.broadcastLogoutEvent();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.isLoggedIn;
  }

   resetSessionTimer(): void {
    clearTimeout(this.sessionTimer);
    this.sessionTimer = setTimeout(() => this.logout(), this.sessionTimeout);
  }

  private setupStorageEventListener(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === this.isLoggedInKey && event.newValue === 'false') {
        this.logout();
      }
    });
  }

  private broadcastLogoutEvent(): void {
    localStorage.setItem(this.isLoggedInKey, 'false');
  }
  private broadcastLoginEvent(): void {
    localStorage.setItem(this.isLoggedInKey, 'true');
  }
}
