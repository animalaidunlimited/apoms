import { ComponentFixture, TestBed, inject, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
    MatLegacyDialogRef as MatDialogRef,
    MatLegacyDialog as MatDialog,
    MatLegacyDialogModule as MatDialogModule,
    MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';
import { PatientCallDialogComponent } from './patient-call-dialog.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('PatientCallDialogComponent', () => {
    let component: PatientCallDialogComponent;
    let fixture: ComponentFixture<PatientCallDialogComponent>;
    const mockDialogRef = {
        open: jasmine.createSpy('open'),
        close: jasmine.createSpy('close'),
    };

    const dialogData = {};

    let dialog: MatDialogRef<PatientCallDialogComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MatDialogModule,
                FormsModule,
                ReactiveFormsModule,
            ],
            providers: [
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: dialogData,
                },
                {
                    provide: MatDialogRef,
                    useValue: mockDialogRef,
                },
            ],
            declarations: [PatientCallDialogComponent],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    }));

    beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
        fixture = TestBed.createComponent(PatientCallDialogComponent);
        component = fixture.componentInstance;
        dialog = TestBed.get(MatDialog);
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
