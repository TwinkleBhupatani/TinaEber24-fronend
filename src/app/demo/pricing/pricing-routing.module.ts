import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CountryComponent } from './country/country.component';
import { CityComponent } from './city/city.component';
import { VehicleTypeComponent } from './vehicle-type/vehicle-type.component';
import { VehiclePricingComponent } from './vehicle-pricing/vehicle-pricing.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'country',
        component: CountryComponent
      },
      {
        path: 'city',
        component: CityComponent
      },
      {
        path: 'vehicle-type',
        component: VehicleTypeComponent
      },
      {
        path: 'vehicle-pricing',
        component: VehiclePricingComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PricingRoutingModule {}
