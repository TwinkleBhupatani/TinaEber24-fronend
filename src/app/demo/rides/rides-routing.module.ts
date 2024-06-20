import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateRideComponent } from './create-ride/create-ride.component';
import { ConfirmedRidesComponent } from './confirmed-rides/confirmed-rides.component';
import { RideHistoryComponent } from './ride-history/ride-history.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'create-ride',
        component: CreateRideComponent
      },
      {
        path: 'confirmed-rides',
        component: ConfirmedRidesComponent
      },
      {
        path: 'ride-history',
        component: RideHistoryComponent
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RidesRoutingModule {}
