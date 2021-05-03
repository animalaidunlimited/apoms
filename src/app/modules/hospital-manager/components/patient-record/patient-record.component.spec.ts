import { ComponentFixture, TestBed, inject, waitForAsync } from '@angular/core/testing';

import { PatientRecordComponent } from './patient-record.component';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';
import { SearchRecordTab } from 'src/app/core/models/search-record-tab';
import { MaterialModule } from 'src/app/material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

describe('PatientRecordComponent', () => {
    let component: PatientRecordComponent;
    let fixture: ComponentFixture<PatientRecordComponent>;

    const incomingPatient: SearchRecordTab = {
        id: 1,
        value: 'New Case',
        emergencyCaseId: 1,
        emergencyNumber: 1,
        patientId: 1,
        tagNumber: 'H100',
        animalType: '',
        currentLocation: '',
        callDateTime: '2020-04-09T12:52',
        callOutcomeId: 1,
        callOutcome: 'Admission',
        icon: 'close',
    };

    const permissions$ = of({componentPermissionLevel: 2});

    const fakeActivatedRoute = { data: permissions$ };

    const formBuilder: FormBuilder = new FormBuilder();

    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [PatientRecordComponent],
            imports: [
                HttpClientTestingModule,
                MaterialModule,
                RouterTestingModule,
                FormsModule,
                ReactiveFormsModule,
                BrowserAnimationsModule
            ],
            providers: [
                { provide: ActivatedRoute, useValue: fakeActivatedRoute },
                { provide: FormBuilder, useValue: formBuilder }
            ]
        }).compileComponents();
    });

    beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
        fixture = TestBed.createComponent(PatientRecordComponent);
        component = fixture.componentInstance;

        component.incomingPatient = incomingPatient;

        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
