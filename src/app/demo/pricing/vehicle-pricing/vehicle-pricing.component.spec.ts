import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiclePricingComponent } from './vehicle-pricing.component';

describe('VehiclePricingComponent', () => {
  let component: VehiclePricingComponent;
  let fixture: ComponentFixture<VehiclePricingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VehiclePricingComponent]
    });
    fixture = TestBed.createComponent(VehiclePricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
