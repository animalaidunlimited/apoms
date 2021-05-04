import { ComponentFixture, TestBed, inject, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EmergencyCaseOutcomeComponent } from './emergency-case-outcome.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('EmergencyCaseOutcomeComponent', () => {
    let component: EmergencyCaseOutcomeComponent;
    let fixture: ComponentFixture<EmergencyCaseOutcomeComponent>;

    const formBuilder: FormBuilder = new FormBuilder();

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MaterialModule,
                FormsModule,
                ReactiveFormsModule,
                BrowserAnimationsModule,
            ],
            providers: [{ provide: FormBuilder, useValue: formBuilder }],
            declarations: [EmergencyCaseOutcomeComponent],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    }));

    beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
        fixture = TestBed.createComponent(EmergencyCaseOutcomeComponent);
        component = fixture.componentInstance;

        component.patientForm = fb.group({
            emergencyDetails: fb.group({
                emergencyCaseId: [1],
            }),
            callOutcome: fb.group({
                CallOutcome: ['Admission'],
            }),
        });

        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
