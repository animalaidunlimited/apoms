import { ComponentFixture, TestBed, inject, waitForAsync } from '@angular/core/testing';

import { PatientStatusComponent } from './patient-status.component';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
    ReactiveFormsModule,
    UntypedFormBuilder,
    FormsModule
} from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Overlay } from '@angular/cdk/overlay';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('PatientStatusComponent', () => {
    let component: PatientStatusComponent;
    let fixture: ComponentFixture<PatientStatusComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                FormsModule,
                ReactiveFormsModule,
                MaterialModule,
                BrowserAnimationsModule,
            ],
            providers: [DatePipe, Overlay, MatSnackBar],
            declarations: [PatientStatusComponent],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    }));

    beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
        fixture = TestBed.createComponent(PatientStatusComponent);
        component = fixture.componentInstance;

        const datePipe = new DatePipe('en-US');

        component.patientId = 1;

        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Invalid form - Missing values', () => {
        const createdDate = new Date();

        component.patientStatusForm.get('patientId')?.setValue(1);
        component.patientStatusForm.get('tagNumber')?.setValue('B150');
        component.patientStatusForm.get('createdDate')?.setValue(createdDate);

        // Not set
        // component.patientStatusForm.get("patientStatusId").setValue(null);
        // component.patientStatusForm.get("patientStatusDate").setValue(null);

        // Not requred
        component.patientStatusForm.get('PN')?.setValue(null);
        component.patientStatusForm.get('suspectedRabies')?.setValue(null);

        expect(component.patientStatusForm.valid).toEqual(false);
    });

    it('Valid form - No Missing values', () => {
        const createdDate = new Date();

        component.patientStatusForm.get('patientId')?.setValue(1);
        component.patientStatusForm.get('tagNumber')?.setValue('B150');
        component.patientStatusForm.get('createdDate')?.setValue(createdDate);

        component.patientStatusForm.get('patientStatusId')?.setValue(1);
        component.patientStatusForm
            .get('patientStatusDate')
            ?.setValue(createdDate);

        // Not requred
        component.patientStatusForm.get('PN')?.setValue(null);
        component.patientStatusForm.get('suspectedRabies')?.setValue(null);

        expect(component.patientStatusForm.valid).toEqual(true);
    });
});
