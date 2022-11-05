import {
    ComponentFixture,
    TestBed,
    inject,
} from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ReactiveFormsModule, FormBuilder, FormsModule, Validators, FormArray } from '@angular/forms';

import { EmergencyDetailsComponent } from './emergency-details.component';
import { MaterialModule } from 'src/app/material-module';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DatePipe } from '@angular/common';
import { RescueDetailsComponent } from '../rescue-details/rescue-details.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('EmergencyDetailsComponent', () => {
    let component: EmergencyDetailsComponent;
    let rescueDetails: RescueDetailsComponent;

    let rescueDetailsFixture: ComponentFixture<RescueDetailsComponent>;
    let fixture: ComponentFixture<EmergencyDetailsComponent>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                FormsModule,
                ReactiveFormsModule,
                MaterialModule,
                BrowserAnimationsModule,
            ],
            providers: [DatePipe],
            declarations: [EmergencyDetailsComponent, RescueDetailsComponent],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    });

    beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
        fixture = TestBed.createComponent(EmergencyDetailsComponent);
        rescueDetailsFixture = TestBed.createComponent(RescueDetailsComponent);

        component = fixture.componentInstance;

        component.recordForm = fb.group({
            emergencyDetails: fb.group({
                emergencyCaseId: [1],
                callDateTime: [''],
            }),
            callOutcome: fb.group({
                CallOutcome: [''],
                CallOutcomeId: []
            }),
            patients: fb.array([])
        });

        const patient =
        fb.group({
            patientId: [],
            GUID: [],
            animalTypeId: ['', Validators.required],
            animalType: ['', Validators.required],
            problems: fb.array([]),
            tagNumber: [''],
            duplicateTag: [false, Validators.required],
            updated: [false, Validators.required],
            deleted: [false, Validators.required],
            isAdmission:[false],
            admissionArea: [],
            admissionAccepted: [false],
            callOutcome: fb.group({
                CallOutcome: [],
                sameAsNumber: []
            }),
        });

        const patientArray = component.recordForm.get('patients') as FormArray;

        patientArray.push(patient);

        fixture.detectChanges();

        //These two component rely on each other as we need to check fields across components
        rescueDetails = rescueDetailsFixture.componentInstance;
        rescueDetails.recordForm = component.recordForm;
        rescueDetails.emergencyCaseId = 17;

        rescueDetailsFixture.detectChanges();

    }));

    afterEach((done) => {
        component.recordForm.reset();
        done();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Valid form - all records', () => {
        component.recordForm.get('emergencyDetails.emergencyNumber')?.setValue('70022');
        component.recordForm.get('emergencyDetails.dispatcher')?.setValue('1');
        component.recordForm.get('emergencyDetails.code')?.setValue('1');

        expect(component.recordForm.get('emergencyDetails')?.valid).toEqual(true);
    });

    it('Invalid form - no records', () => {
        expect(component.recordForm.get('emergencyDetails')?.valid).toEqual(false);
    });

    it('Invalid form - Missing code', () => {
        component.recordForm.get('emergencyDetails.emergencyNumber')?.setValue(70022);

        // component.recordForm.get('emergencyDetails.emergencyCode')?.setValue({ EmergencyCodeId: 1, EmergencyCode: "Red"});
        component.recordForm.get('rescueDetails.ambulanceAssignmentTime')?.setValue('2022-11-05T13:25:00');

        component.recordForm.get('emergencyDetails.code')?.setValue(null);

        component.recordForm.get('rescueDetails.assignedVehicleId')?.setValue(1);

        console.log(component.recordForm)

        rescueDetails.updateValidators();

        expect(component.recordForm.get('emergencyDetails')?.valid).toEqual(false);
    });

    it('Valid form - Emergency code', () => {
        component.recordForm.get('emergencyDetails.emergencyNumber')?.setValue(70022);

        component.recordForm.get('emergencyDetails.code')?.setValue({ EmergencyCodeId: 1, EmergencyCode: "Red"});
        component.recordForm.get('emergencyDetails.dispatcher')?.setValue('1');

        component.recordForm.get('rescueDetails.assignedVehicleId')?.setValue(1);

        rescueDetails.updateValidators();

        expect(component.recordForm.get('emergencyDetails')?.valid).toEqual(true);
    });

    it('Set Initial Time Works', () => {

        const testTime = new Date();

        component.recordForm.get('emergencyDetails.callDateTime')?.setValue(testTime);

        expect(component.recordForm.get('emergencyDetails.callDateTime')?.value).toEqual(testTime);
    });
});
