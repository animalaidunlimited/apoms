import { ComponentFixture, TestBed, inject, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {
    MatLegacyDialogRef as MatDialogRef,
    MatLegacyDialog as MatDialog,
    MatLegacyDialogModule as MatDialogModule,
    MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';
import { SurgeryRecordDialogComponent } from './surgery-record-dialog.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('SurgeryRecordDialogComponent', () => {
    let component: SurgeryRecordDialogComponent;
    let fixture: ComponentFixture<SurgeryRecordDialogComponent>;

    const mockDialogRef = {
        open: jasmine.createSpy('open'),
        close: jasmine.createSpy('close'),
    };

    const dialogData = {};

    let dialog: MatDialogRef<SurgeryRecordDialogComponent>;

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
            declarations: [SurgeryRecordDialogComponent],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    }));

    beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
        fixture = TestBed.createComponent(SurgeryRecordDialogComponent);
        component = fixture.componentInstance;
        dialog = TestBed.get(MatDialog);
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
