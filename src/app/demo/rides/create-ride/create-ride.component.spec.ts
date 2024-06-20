import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRideComponent } from './create-ride.component';

describe('CreateRideComponent', () => {
  let component: CreateRideComponent;
  let fixture: ComponentFixture<CreateRideComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateRideComponent]
    });
    fixture = TestBed.createComponent(CreateRideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
