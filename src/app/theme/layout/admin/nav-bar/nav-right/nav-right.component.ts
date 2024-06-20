// Angular import
import { Component } from '@angular/core';
import { SessionService } from '../../../../../services/session.service';

@Component({
  selector: 'app-nav-right',
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent {

  constructor(private sessionService: SessionService) {}

  logout(): void {
    console.log("logout");
    this.sessionService.logout();
  }
}
