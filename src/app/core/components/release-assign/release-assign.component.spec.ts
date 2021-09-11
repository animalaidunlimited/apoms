import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material-module';

import { ReleaseAssignComponent } from './release-assign.component';

describe('ReleaseAssignComponent', () => {
  let component: ReleaseAssignComponent;
  let fixture: ComponentFixture<ReleaseAssignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        MaterialModule,
        ReactiveFormsModule,
        BrowserAnimationsModule
      ],
      declarations: [ ReleaseAssignComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
    fixture = TestBed.createComponent(ReleaseAssignComponent);
    component = fixture.componentInstance;

    component.formData = {
      releaseId: 100,
      emergencyCaseId:100,
      releaseType: '',
      releaseAmbulanceId:0,
      releaseBeginDate: new Date(),
      releaseEndDate: new Date(),
      pickupDate: new Date(),
      assignedVehicleId: 1,
      ambulanceAssignmentTime: new Date()
    };

    fixture.detectChanges();

  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
