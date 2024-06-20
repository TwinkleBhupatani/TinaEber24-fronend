import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { UsersComponent } from './demo/users/users.component';
import { SettingsComponent } from './demo/settings/settings.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full', }, 
  {
    path: '',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: '/default', 
        pathMatch: 'full'
      },
      {
        path: 'default',
        loadComponent: () => import('./demo/default/default.component'),     
      },
      {
        path: 'users',
        component: UsersComponent
      },
      // {
      //   path: 'rides/create-ride',
      //   component: CreateRideComponent
      // },
      // {
      //   path: 'rides/confirmed-rides',
      //   component: ConfirmedRidesComponent
      // },
      // {
      //   path: 'rides/ride-history',
      //   component: RideHistoryComponent
      // },
      {
        path:'rides',
        loadChildren: () => import('./demo/rides/rides.module').then((m) => m.RidesModule)
      },
      {
        path:'drivers',
        loadChildren: () => import('./demo/drivers/drivers.module').then((m) => m.DriversModule)
      },
      {
        path:'pricing',
        loadChildren: () => import('./demo/pricing/pricing.module').then((m) => m.PricingModule)
      },
      {
        path: 'settings',
        component: SettingsComponent
      },     
    ]
  },
  {path:'login', component: LoginComponent},
  {path:'**', component: PageNotFoundComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
