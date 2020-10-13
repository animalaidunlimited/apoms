import {
    async,
    ComponentFixture,
    TestBed,
    inject,
} from '@angular/core/testing';

import { RescueDetailsComponent } from './rescue-details.component';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('RescueDetailsComponent', () => {
    let component: RescueDetailsComponent;
    let fixture: ComponentFixture<RescueDetailsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                FormsModule,
                ReactiveFormsModule,
                MaterialModule,
                BrowserAnimationsModule,
            ],
            declarations: [RescueDetailsComponent],
        }).compileComponents();
    }));

    beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
        fixture = TestBed.createComponent(RescueDetailsComponent);
        component = fixture.componentInstance;

        component.emergencyCaseId = 1;

        component.recordForm = fb.group({
            emergencyDetails: fb.group({
                emergencyCaseId: [1],
                callDateTime: [''],
            }),
            callOutcome: fb.group({
                CallOutcome: [''],
                CallOutcomeId: []
            }),
        });

        fixture.detectChanges();
    }));

    afterEach(function(done) {
        component.recordForm.reset();
        component.updateValidators();
        done();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Invalid form - worker but no driver', () => {
        component.recordForm.get('rescueDetails.rescuer1Id')?.setValue(1);
        component.updateValidators();

        expect(component.recordForm.valid).toEqual(false);
    });

    it('Invalid form - driver but no worker', () => {
        component.recordForm.get('rescueDetails.rescuer2Id')?.setValue(1);
        component.updateValidators();

        expect(component.recordForm.valid).toEqual(false);
    });
    it('Valid form - driver and worker', () => {
        component.recordForm.get('rescueDetails.rescuer1Id')?.setValue(1);
        component.recordForm.get('rescueDetails.rescuer2Id')?.setValue(2);
        component.updateValidators();

        expect(component.recordForm.valid).toEqual(true);
    });

    it('Invalid form - Ambulance arrival time only', () => {
        const ambulanceArrivalTime = new Date();
        component.recordForm.get('rescueDetails.ambulanceArrivalTime')?.setValue(ambulanceArrivalTime);
        component.updateValidators();

        expect(component.recordForm.valid).toEqual(false);
    });

    it('Valid form - Ambulance arrival time only - with driver/worker', () => {
        component.recordForm.get('rescueDetails.rescuer1Id')?.setValue(1);
        component.recordForm.get('rescueDetails.rescuer2Id')?.setValue(2);

        const ambulanceArrivalTime = new Date();
        component.recordForm.get('rescueDetails.ambulanceArrivalTime')?.setValue(ambulanceArrivalTime);
        component.updateValidators();

        expect(component.recordForm.valid).toEqual(true);
    });

    it('Invalid form - Rescue time only', () => {
        const rescueTime = new Date();
        component.recordForm.get('rescueDetails.rescueTime')?.setValue(rescueTime);
        component.updateValidators();

        expect(component.recordForm.valid).toEqual(false);
    });

    it('Valid form - Rescue time only, with driver/worker', () => {
        component.recordForm.get('rescueDetails.rescuer1Id')?.setValue(1);
        component.recordForm.get('rescueDetails.rescuer2Id')?.setValue(2);

        const rescueTime = new Date();
        component.recordForm.get('rescueDetails.rescueTime')?.setValue(rescueTime);
        component.updateValidators();

        expect(component.recordForm.valid).toEqual(true);
    });

    it('Invalid form - Admission time only', () => {
        const admissionTime = new Date();
        component.recordForm.get('rescueDetails.admissionTime')?.setValue(admissionTime);
        component.updateValidators();

        expect(component.recordForm.valid).toEqual(false);
    });

    it('Invalid form - Rescue and Admission time only', () => {
        const currentTime = new Date();
        component.recordForm.get('rescueDetails.rescueTime')?.setValue(currentTime);

        component.recordForm.get('rescueDetails.admissionTime')?.setValue(currentTime);
        component.updateValidators();

        expect(component.recordForm.valid).toEqual(false);
    });

    it('Valid form - Rescue and Admission time only', () => {
        component.recordForm.get('rescueDetails.rescuer1Id')?.setValue(1);
        component.recordForm.get('rescueDetails.rescuer2Id')?.setValue(2);

        const currentTime = new Date();
        component.recordForm.get('rescueDetails.rescueTime')?.setValue(currentTime);

        component.recordForm.get('rescueDetails.admissionTime')?.setValue(currentTime);
        component.updateValidators();

        expect(component.recordForm.valid).toEqual(true);
    });

    it('Invalid form - Ambulance arrival and Rescue time only', () => {
        const currentTime = new Date();
        component.recordForm.get('rescueDetails.rescueTime')?.setValue(currentTime);

        component.recordForm.get('rescueDetails.ambulanceArrivalTime')?.setValue(currentTime);
        component.updateValidators();

        expect(component.recordForm.valid).toEqual(false);
    });

    it('Valid form - Ambulance arrival and Rescue time only', () => {
        component.recordForm.get('rescueDetails.rescuer1Id')?.setValue(1);
        component.recordForm.get('rescueDetails.rescuer2Id')?.setValue(2);

        const currentTime = new Date();
        component.recordForm.get('rescueDetails.rescueTime')?.setValue(currentTime);

        component.recordForm.get('rescueDetails.ambulanceArrivalTime')?.setValue(currentTime);
        component.updateValidators();

        expect(component.recordForm.valid).toEqual(true);
    });

    it('Invalid form - Ambulance arrival and Admission time only', () => {
        component.recordForm.get('rescueDetails.rescuer1Id')?.setValue(1);
        component.recordForm.get('rescueDetails.rescuer2Id')?.setValue(2);

        const currentTime = new Date();
        component.recordForm.get('rescueDetails.admissionTime')?.setValue(currentTime);

        component.recordForm.get('rescueDetails.ambulanceArrivalTime')?.setValue(currentTime);
        component.updateValidators();

        expect(component.recordForm.valid).toEqual(false);
    });

    it('Invalid form - Ambulance arrival, Rescue, and Admission time only', () => {
        const currentTime = new Date();

        component.recordForm.get('rescueDetails.ambulanceArrivalTime')?.setValue(currentTime);

        component.recordForm.get('rescueDetails.rescueTime')?.setValue(currentTime);

        component.recordForm.get('rescueDetails.admissionTime')?.setValue(currentTime);

        component.updateValidators();

        expect(component.recordForm.valid).toEqual(false);
    });

    it('Valid form - Ambulance arrival, Rescue, and Admission time only', () => {
        component.recordForm.get('rescueDetails.rescuer1Id')?.setValue(1);
        component.recordForm.get('rescueDetails.rescuer2Id')?.setValue(2);

        const currentTime = new Date();

        component.recordForm.get('rescueDetails.ambulanceArrivalTime')?.setValue(currentTime);

        component.recordForm.get('rescueDetails.rescueTime')?.setValue(currentTime);

        component.recordForm.get('rescueDetails.admissionTime')?.setValue(currentTime);

        component.updateValidators();

        expect(component.recordForm.valid).toEqual(true);
    });

    it('Invalid form - Ambulance arrival time after Rescue time', () => {
        component.recordForm.get('rescueDetails.rescuer1Id')?.setValue(1);
        component.recordForm.get('rescueDetails.rescuer2Id')?.setValue(2);

        const ambulanceArrivalTime = new Date();
        component.recordForm.get('rescueDetails.ambulanceArrivalTime')?.setValue(ambulanceArrivalTime);

        const rescueTime = new Date();
        rescueTime.setHours(rescueTime.getHours() - 4);
        component.recordForm.get('rescueDetails.rescueTime')?.setValue(rescueTime);

        component.updateValidators();

        expect(component.recordForm.valid).toEqual(false);
    });

    it('Invalid form - Ambulance arrival time after Admission time', () => {
        component.recordForm.get('rescueDetails.rescuer1Id')?.setValue(1);
        component.recordForm.get('rescueDetails.rescuer2Id')?.setValue(2);

        const ambulanceArrivalTime = new Date();
        component.recordForm.get('rescueDetails.ambulanceArrivalTime')?.setValue(ambulanceArrivalTime);

        const admissionTime = new Date();
        admissionTime.setHours(admissionTime.getHours() - 4);
        component.recordForm.get('rescueDetails.admissionTime')?.setValue(admissionTime);

        component.updateValidators();

        expect(component.recordForm.valid).toEqual(false);
    });

    it('Invalid form - Rescue time after Admission time', () => {
        component.recordForm.get('rescueDetails.rescuer1Id')?.setValue(1);
        component.recordForm.get('rescueDetails.rescuer2Id')?.setValue(2);

        const ambulanceArrivalTime = new Date();
        component.recordForm.get('rescueDetails.ambulanceArrivalTime')?.setValue(ambulanceArrivalTime);

        const admissionTime = new Date();
        admissionTime.setHours(admissionTime.getHours() - 4);
        component.recordForm.get('rescueDetails.admissionTime')?.setValue(admissionTime);

        component.updateValidators();

        expect(component.recordForm.valid).toEqual(false);
    });

    it('Valid form - Ambulance arrival time before, Rescue time before Admission time', () => {
        component.recordForm.get('rescueDetails.rescuer1Id')?.setValue(1);
        component.recordForm.get('rescueDetails.rescuer2Id')?.setValue(2);

        const ambulanceArrivalTime = new Date();
        ambulanceArrivalTime.setHours(ambulanceArrivalTime.getHours() - 4);
        component.recordForm.get('rescueDetails.ambulanceArrivalTime')?.setValue(ambulanceArrivalTime);

        const rescueTime = new Date();
        rescueTime.setHours(rescueTime.getHours() - 2);
        component.recordForm.get('rescueDetails.rescueTime')?.setValue(rescueTime);

        const admissionTime = new Date();
        component.recordForm.get('rescueDetails.admissionTime')?.setValue(admissionTime);

        component.updateValidators();

        expect(component.recordForm.valid).toEqual(true);
    });
});
