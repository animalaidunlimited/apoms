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

  afterEach(function(done) {

    component.recordForm.reset();
    done();

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('Valid form - all records', () => {
    component.recordForm.get('emergencyDetails.emergencyNumber').setValue('70022');
    component.recordForm.get('emergencyDetails.dispatcher').setValue("1");
    component.recordForm.get('emergencyDetails.code').setValue("1");

    expect(component.recordForm.get("emergencyDetails").valid).toEqual(true);
  });

  it('Invalid form - no records', () => {

    expect(component.recordForm.get("emergencyDetails").valid).toEqual(false);
  });

  it('Invalid form - Missing code', () => {
    component.recordForm.get('emergencyDetails.emergencyNumber').setValue(70022);

    component.recordForm.get('emergencyDetails.dispatcher').setValue(1);

    expect(component.recordForm.get("emergencyDetails").valid).toEqual(false);
  });

  it('Set Initial Time Works', () => {

    component.setInitialTime();

    let testTime = new Date();

    component.recordForm.get("emergencyDetails.callDateTime").setValue(testTime)

    expect(component.recordForm.get("emergencyDetails.callDateTime").value).toEqual(testTime)
  });

});
