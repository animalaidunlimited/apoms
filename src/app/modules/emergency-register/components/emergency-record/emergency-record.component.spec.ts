import { ComponentFixture, TestBed, inject, waitForAsync } from '@angular/core/testing';
import { EmergencyRecordComponent } from './emergency-record.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, UntypedFormBuilder, FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, of } from 'rxjs';
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { EmergencyCaseOutcomeComponent } from '../emergency-case-outcome/emergency-case-outcome.component';

describe('EmergencyRecordComponent', () => {
    let component: EmergencyRecordComponent;
    let fixture: ComponentFixture<EmergencyRecordComponent>;
    const formBuilder: UntypedFormBuilder = new UntypedFormBuilder();

    const permissions$ = of({componentPermissionLevel: 2});

    const fakeActivatedRoute = { data: permissions$ };

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                FormsModule,
                ReactiveFormsModule,
                MaterialModule,
                RouterTestingModule,
                BrowserAnimationsModule,
                AngularFireModule.initializeApp(environment.firebase)
            ],
            providers: [
                { provide: ActivatedRoute, useValue: fakeActivatedRoute },
                { provide: UntypedFormBuilder, useValue: formBuilder }
            ],
            declarations: [
                EmergencyRecordComponent,
                EmergencyCaseOutcomeComponent
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    });

    beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
        fixture = TestBed.createComponent(EmergencyRecordComponent);
        component = fixture.componentInstance;

        component.guId = new BehaviorSubject<string>('4982d3a3-0fc7-464b-bdba-5bed2e255398');

        component.recordForm = fb.group({
            emergencyDetails: fb.group({
                emergencyCaseId: [1],
            }),
            callOutcome: fb.group({
                callOutcome: [''],
            }),
        });

        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
