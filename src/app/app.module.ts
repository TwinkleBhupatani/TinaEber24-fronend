import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {LoginService} from './login/login.service'
import {SessionService} from './services/session.service'
import { AuthGuard } from './auth.guard';
import { SocketService } from './services/socket.service';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { NavigationItem } from './theme/layout/admin/navigation/navigation';
import { NavBarComponent } from './theme/layout/admin/nav-bar/nav-bar.component';
import { NavLeftComponent } from './theme/layout/admin/nav-bar/nav-left/nav-left.component';
import { NavRightComponent } from './theme/layout/admin/nav-bar/nav-right/nav-right.component';
import { NavigationComponent } from './theme/layout/admin/navigation/navigation.component';
import { NavLogoComponent } from './theme/layout/admin/nav-bar/nav-logo/nav-logo.component';
import { NavContentComponent } from './theme/layout/admin/navigation/nav-content/nav-content.component';
import { NavGroupComponent } from './theme/layout/admin/navigation/nav-content/nav-group/nav-group.component';
import { NavCollapseComponent } from './theme/layout/admin/navigation/nav-content/nav-collapse/nav-collapse.component';
import { NavItemComponent } from './theme/layout/admin/navigation/nav-content/nav-item/nav-item.component';
import { ListComponent } from './demo/drivers/list/list.component';
import { RunningRequestComponent } from './demo/drivers/running-request/running-request.component';
import { CityComponent } from './demo/pricing/city/city.component';
import { CountryComponent } from './demo/pricing/country/country.component';
import { VehiclePricingComponent } from './demo/pricing/vehicle-pricing/vehicle-pricing.component';
import { VehicleTypeComponent } from './demo/pricing/vehicle-type/vehicle-type.component';
import { ConfirmedRidesComponent } from './demo/rides/confirmed-rides/confirmed-rides.component';
import { CreateRideComponent } from './demo/rides/create-ride/create-ride.component';
import { RideHistoryComponent } from './demo/rides/ride-history/ride-history.component';
import { UsersComponent } from './demo/users/users.component';
import { SettingsComponent } from './demo/settings/settings.component';
import { LoginComponent } from './login/login.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

import { environment } from 'src/environments/environment';


@NgModule({
  declarations: [
    AppComponent,
    AdminComponent,
    NavBarComponent,
    NavLeftComponent,
    NavRightComponent,
    NavigationComponent,
    NavLogoComponent,
    NavContentComponent,
    NavGroupComponent,
    NavItemComponent,
    NavCollapseComponent,
    ListComponent,
    RunningRequestComponent,
    CreateRideComponent,
    ConfirmedRidesComponent,
    RideHistoryComponent,
    CountryComponent,
    CityComponent,
    VehiclePricingComponent,
    VehicleTypeComponent,
    SettingsComponent,
    UsersComponent,
    LoginComponent,
    PageNotFoundComponent
  ],
  imports: [BrowserModule, AppRoutingModule, BrowserAnimationsModule, HttpClientModule, FormsModule, ReactiveFormsModule],
  providers: [NavigationItem, LoginService, SessionService, NgbActiveModal, NgbModule, AuthGuard,SocketService],
  bootstrap: [AppComponent]
})
export class AppModule {

}
