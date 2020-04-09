import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';

import { EmergencyDetailsComponent } from './emergency-details.component';
import { MaterialModule } from 'src/app/material-module';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('EmergencyDetailsComponent', () => {
  let component: EmergencyDetailsComponent;
  let fixture: ComponentFixture<EmergencyDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, ReactiveFormsModule,
        MaterialModule, BrowserAnimationsModule],

      declarations: [ EmergencyDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
    fixture = TestBed.createComponent(EmergencyDetailsComponent);
    component = fixture.componentInstance;

    component.recordForm = fb.group({

      emergencyDetails: fb.group({
        emergencyCaseId: [1]
      }),
      callOutcome: fb.group({
        callOutcome: ['']
      })
    }
    );

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
