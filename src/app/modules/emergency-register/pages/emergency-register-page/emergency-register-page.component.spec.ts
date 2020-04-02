import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergencyRegisterPageComponent } from './emergency-register-page.component';

describe('EmergencyRegisterPageComponent', () => {
  let component: EmergencyRegisterPageComponent;
  let fixture: ComponentFixture<EmergencyRegisterPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmergencyRegisterPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmergencyRegisterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
