import { ComponentFixture, TestBed, inject, waitForAsync } from '@angular/core/testing';

import { CallerDetailsComponent } from './caller-details.component';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MaterialModule } from 'src/app/material-module';

import { MatFormFieldModule } from '@angular/material/form-field';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CallerDetailsComponent', () => {
    let component: CallerDetailsComponent;
    let fixture: ComponentFixture<CallerDetailsComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MatFormFieldModule,
                MaterialModule,
                NoopAnimationsModule,
                MatAutocompleteModule,
                FormsModule,
                ReactiveFormsModule,
            ],
            declarations: [CallerDetailsComponent],
        }).compileComponents();
    }));

    beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
        fixture = TestBed.createComponent(CallerDetailsComponent);
        component = fixture.componentInstance;

        component.recordForm = fb.group({
            emergencyDetails: fb.group({
                emergencyCaseId: [1],
                updateTime: [''],
            }),
            callOutcome: fb.group({
                callOutcome: [''],
            }),
        });

        fixture.detectChanges();
    }));

    afterEach((done) => {
        component.recordForm.reset();
        done();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

});
