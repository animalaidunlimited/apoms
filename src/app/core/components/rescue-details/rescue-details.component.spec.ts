import { ComponentFixture, TestBed, inject, waitForAsync } from '@angular/core/testing';

import { RescueDetailsComponent } from './rescue-details.component';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, UntypedFormBuilder, FormsModule, Validators, FormArray } from '@angular/forms';
import { MaterialModule } from 'src/app/material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';

describe('RescueDetailsComponent', () => {
    let component: RescueDetailsComponent;
    let fixture: ComponentFixture<RescueDetailsComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                FormsModule,
                ReactiveFormsModule,
                MaterialModule,
                BrowserAnimationsModule,
            ],
            declarations: [RescueDetailsComponent],
            providers: [ MatSnackBar ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    }));

    beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
        fixture = TestBed.createComponent(RescueDetailsComponent);
        component = fixture.componentInstance;

        component.emergencyCaseId = 1;


        component.recordForm = fb.group({
            emergencyDetails: fb.group({
                emergencyCaseId: [1],
                callDateTime: [''],
            }),
            patients: fb.array([]),
            rescueDetails:fb.group({
                assignedVehicleId: [],
                ambulanceAssignmentTime: [''],
                ambulanceArrivalTime: [''],
                rescueTime: [''],
                admissionTime: [''],
                code: [],
                selfAdmission: false,
                rescuers: fb.array([])
            })
        });



       const patientArray = component.recordForm.get('patients') as FormArray;

       const patient =
       fb.group({
           patientId: [],
           GUID: [0],
           animalTypeId: [5, Validators.required],
           animalType: ['Puppy', Validators.required],
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

        patientArray.push(patient);

        setTimeout(() =>{
            patientArray.at(0).get('animalType')?.setValue('Puppy');
            patientArray.at(0).get('duplicateTag')?.setValue(false);
            patientArray.at(0).get('updated')?.setValue(false);
            patientArray.at(0).get('deleted')?.setValue(false);
            patientArray.at(0).get('animalTypeId')?.setValue(5);
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



    it('Invalid form - Ambulance arrival time only', () => {
        const ambulanceArrivalTime = new Date();
        component.recordForm.get('rescueDetails.ambulanceArrivalTime')?.setValue(ambulanceArrivalTime);
        component.recordForm.get('rescueDetails.code')?.setValue(1);
        component.updateValidators();
        expect(component.recordForm.valid).toEqual(false);
    });


    it('Invalid form - Rescue time only', () => {
        const rescueTime = new Date();
        component.recordForm.get('rescueDetails.rescueTime')?.setValue(rescueTime);
        component.updateValidators();
        expect(component.recordForm.valid).toEqual(false);
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


    it('Invalid form - Ambulance arrival and Rescue time only', () => {
        const currentTime = new Date();
        component.recordForm.get('rescueDetails.rescueTime')?.setValue(currentTime);

        component.recordForm.get('rescueDetails.ambulanceArrivalTime')?.setValue(currentTime);
        component.recordForm.get('rescueDetails.code')?.setValue(1);
        component.updateValidators();

        expect(component.recordForm.valid).toEqual(false);

    });



    it('Invalid form - Ambulance arrival and Admission time only', () => {

        const currentTime = new Date();
        component.recordForm.get('rescueDetails.admissionTime')?.setValue(currentTime);

        component.recordForm.get('rescueDetails.ambulanceArrivalTime')?.setValue(currentTime);
        component.recordForm.get('rescueDetails.code')?.setValue(1);
        component.updateValidators();

        expect(component.recordForm.valid).toEqual(false);
    });

    it('Invalid form - Ambulance arrival, Rescue, and Admission time only', () => {
        const currentTime = new Date();

        component.recordForm.get('rescueDetails.ambulanceArrivalTime')?.setValue(currentTime);
        component.recordForm.get('rescueDetails.code')?.setValue(1);

        component.recordForm.get('rescueDetails.rescueTime')?.setValue(currentTime);

        component.recordForm.get('rescueDetails.admissionTime')?.setValue(currentTime);

        component.updateValidators();

        expect(component.recordForm.valid).toEqual(false);
    });


    it('Invalid form - Ambulance arrival time after Rescue time', () => {


        const ambulanceArrivalTime = new Date();
        component.recordForm.get('rescueDetails.ambulanceArrivalTime')?.setValue(ambulanceArrivalTime);
        component.recordForm.get('rescueDetails.code')?.setValue(1);

        const rescueTime = new Date();
        rescueTime.setHours(rescueTime.getHours() - 4);
        component.recordForm.get('rescueDetails.rescueTime')?.setValue(rescueTime);

        component.updateValidators();

        expect(component.recordForm.valid).toEqual(false);

    });

    it('Invalid form - Ambulance arrival time after Admission time', () => {


        const ambulanceArrivalTime = new Date();
        component.recordForm.get('rescueDetails.ambulanceArrivalTime')?.setValue(ambulanceArrivalTime);
        component.recordForm.get('rescueDetails.code')?.setValue(1);

        const admissionTime = new Date();
        admissionTime.setHours(admissionTime.getHours() - 4);
        component.recordForm.get('rescueDetails.admissionTime')?.setValue(admissionTime);

        component.updateValidators();



        expect(component.recordForm.valid).toEqual(false);


    });

    it('Invalid form - Rescue time after Admission time', () => {


        const ambulanceArrivalTime = new Date();
        component.recordForm.get('rescueDetails.ambulanceArrivalTime')?.setValue(ambulanceArrivalTime);
        component.recordForm.get('rescueDetails.code')?.setValue(1);

        const admissionTime = new Date();
        admissionTime.setHours(admissionTime.getHours() - 4);
        component.recordForm.get('rescueDetails.admissionTime')?.setValue(admissionTime);

        component.updateValidators();

        expect(component.recordForm.valid).toEqual(false);


    });


    it('Valid form - Ambulance arrival time and assigned vehicle id', () => {

        const ambulanceArrivalTime = new Date();
        component.recordForm.get('rescueDetails.ambulanceArrivalTime')?.setValue(ambulanceArrivalTime);
        component.recordForm.get('rescueDetails.ambulanceAssignmentTime')?.setValue(ambulanceArrivalTime);
        component.recordForm.get('rescueDetails.assignedVehicleId')?.setValue(10);
        component.recordForm.get('rescueDetails.code')?.setValue(1);
        component.updateValidators();
        expect(component.recordForm.valid).toEqual(true);

    });

    it('Valid form - Rescue time only, with driver/worker', () => {
        component.recordForm.get('rescueDetails.rescueTime')?.setValue(new Date());
        component.recordForm.get('rescueDetails.ambulanceArrivalTime')?.setValue(new Date());
        component.recordForm.get('rescueDetails.ambulanceAssignmentTime')?.setValue(new Date());
        component.recordForm.get('rescueDetails.assignedVehicleId')?.setValue(10);
        component.recordForm.get('rescueDetails.code')?.setValue(1);

        component.updateValidators();
        expect(component.recordForm.valid).toEqual(true);


    });

    it('Valid form - Rescue, Admission time and vehicle id only', () => {

        component.recordForm.get('rescueDetails.rescueTime')?.setValue(new Date());
        component.recordForm.get('rescueDetails.ambulanceArrivalTime')?.setValue(new Date());
        component.recordForm.get('rescueDetails.ambulanceAssignmentTime')?.setValue(new Date());
        component.recordForm.get('rescueDetails.assignedVehicleId')?.setValue(10);
        component.recordForm.get('rescueDetails.admissionTime')?.setValue(new Date());
        component.recordForm.get('rescueDetails.code')?.setValue(1);

        component.updateValidators();

        expect(component.recordForm.valid).toEqual(true);


    });

    it('Valid form - Ambulance arrival and Rescue time only', () => {



        component.recordForm.get('rescueDetails.code')?.setValue(1);

        const currentTime = new Date();
        component.recordForm.get('rescueDetails.rescueTime')?.setValue(currentTime);
        component.recordForm.get('rescueDetails.ambulanceAssignmentTime')?.setValue(currentTime);
        component.recordForm.get('rescueDetails.ambulanceArrivalTime')?.setValue(currentTime);
        component.recordForm.get('rescueDetails.assignedVehicleId')?.setValue(10);


        component.updateValidators();

        expect(component.recordForm.valid).toEqual(true);


    });

    it('Valid form - Ambulance arrival, Rescue, and Admission time only', () => {

        component.recordForm.get('rescueDetails.assignedVehicleId')?.setValue(10);

        const currentTime = new Date();

        component.recordForm.get('rescueDetails.ambulanceArrivalTime')?.setValue(currentTime);
        component.recordForm.get('rescueDetails.ambulanceAssignmentTime')?.setValue(currentTime);
        component.recordForm.get('rescueDetails.assignedVehicleId')?.setValue(10);


        component.recordForm.get('rescueDetails.rescueTime')?.setValue(currentTime);

        component.recordForm.get('rescueDetails.admissionTime')?.setValue(currentTime);

        component.recordForm.get('rescueDetails.code')?.setValue(1);



        component.updateValidators();

        expect(component.recordForm.valid).toEqual(true);


    });

    it('Valid form - Ambulance arrival time before, Rescue time before Admission time', () => {




        const ambulanceArrivalTime = new Date();
        ambulanceArrivalTime.setHours(ambulanceArrivalTime.getHours() - 4);
        component.recordForm.get('rescueDetails.ambulanceArrivalTime')?.setValue(ambulanceArrivalTime);

        component.recordForm.get('rescueDetails.ambulanceAssignmentTime')?.setValue(ambulanceArrivalTime);
        component.recordForm.get('rescueDetails.assignedVehicleId')?.setValue(10);
        component.recordForm.get('rescueDetails.code')?.setValue(1);

        const rescueTime = new Date();
        rescueTime.setHours(rescueTime.getHours() - 2);
        component.recordForm.get('rescueDetails.rescueTime')?.setValue(rescueTime);

        const admissionTime = new Date();
        component.recordForm.get('rescueDetails.admissionTime')?.setValue(admissionTime);

        component.updateValidators();
        expect(component.recordForm.valid).toEqual(true);

    });
});