import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { EmergencyRecordComponent } from './emergency-record.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';

describe('EmergencyRecordComponent', () => {
    let component: EmergencyRecordComponent;
    let fixture: ComponentFixture<EmergencyRecordComponent>;
    const formBuilder: FormBuilder = new FormBuilder();

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                FormsModule,
                ReactiveFormsModule,
                MaterialModule,
                BrowserAnimationsModule,
                AngularFireModule.initializeApp(environment.firebase)
            ],
            providers: [{ provide: FormBuilder, useValue: formBuilder }],
            declarations: [ EmergencyRecordComponent ],
        }).compileComponents();
    }));

    beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
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
