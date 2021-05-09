import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PatientCallComponent } from './patient-call.component';

import { HttpClientTestingModule } from '@angular/common/http/testing';

import { FormBuilder } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('PatientCallComponent', () => {
    let component: PatientCallComponent;
    let fixture: ComponentFixture<PatientCallComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MatSnackBarModule],
            declarations: [PatientCallComponent],
            providers: [FormBuilder],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PatientCallComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
