import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergencyRegisterPatientComponent } from './emergency-register-patients.component';

describe('EmergencyRegisterPatientsComponent', () => {
  let component: EmergencyRegisterPatientComponent;
  let fixture: ComponentFixture<EmergencyRegisterPatientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmergencyRegisterPatientComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmergencyRegisterPatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
