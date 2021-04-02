import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'src/app/material-module';

import { EmergencyRegisterPatientComponent } from './emergency-register-patient.component';

describe('EmergencyRegisterPatientComponent', () => {
  let component: EmergencyRegisterPatientComponent;
  let fixture: ComponentFixture<EmergencyRegisterPatientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule, 
        MatDialogModule,
        RouterTestingModule,
        MaterialModule
    ],
    providers: [
      { provide: MatDialogRef, useValue: {} },
	    { provide: MAT_DIALOG_DATA, useValue: [] }
  ],
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
