import { ComponentFixture, TestBed, inject, waitForAsync } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PatientDetailsComponent } from './patient-details.component';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MaterialModule } from 'src/app/material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('PatientDetailsComponent', () => {
    let component: PatientDetailsComponent;
    let fixture: ComponentFixture<PatientDetailsComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                FormsModule,
                ReactiveFormsModule,
                MaterialModule,
                BrowserAnimationsModule,
            ],
            declarations: [PatientDetailsComponent],
        }).compileComponents();
    }));

    beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
        fixture = TestBed.createComponent(PatientDetailsComponent);
        component = fixture.componentInstance;

        component.recordForm = fb.group({
            patientDetails: fb.group({
                patientId: [1],
            }),
        });

        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
