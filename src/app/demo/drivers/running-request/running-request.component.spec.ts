import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunningRequestComponent } from './running-request.component';

describe('RunningRequestComponent', () => {
  let component: RunningRequestComponent;
  let fixture: ComponentFixture<RunningRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RunningRequestComponent]
    });
    fixture = TestBed.createComponent(RunningRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
