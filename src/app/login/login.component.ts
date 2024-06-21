import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {LoginService} from './login.service';
import {SessionService} from '../services/session.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  id: string = '';
  password: string = ''; 
  submitted: boolean = false;
  
  constructor(private loginService: LoginService, private router: Router, private sessionService: SessionService ) {}

  ngOnInit(): void {
    if (this.sessionService.isAuthenticated()) {
      this.router.navigate(['/default']);
    }
    window.addEventListener('storage', (event) => {
      if (event.key === 'isLoggedIn' && event.newValue === 'true') {
        this.router.navigate(['/default']);
      }
     
    });
  }

  login(): void { 
    this.submitted = true;
    // console.log('Logging in with:', { id: this.id, password: this.password });
    this.loginService.login(this.id.trim(), this.password.trim()).subscribe(
      (response) => {
        console.log('Login successful:', response);
        alert("Login Sucessful");
        this.sessionService.login();
        this.router.navigate(['/default']);
      },
      (error) => {
        if (error.status === 401) {
          alert("Incorrect Username and password");
          console.error('Incorrect username or password');
        } else {
          console.error('Login failed:', error);
          alert("Login Unsuccessful")
        }
      }
    );
    
  }
}
