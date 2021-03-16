import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergencyRegisterPatientsComponent } from './emergency-register-patients.component';

describe('EmergencyRegisterPatientsComponent', () => {
  let component: EmergencyRegisterPatientsComponent;
  let fixture: ComponentFixture<EmergencyRegisterPatientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmergencyRegisterPatientsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmergencyRegisterPatientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
