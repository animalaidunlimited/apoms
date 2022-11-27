import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PatientEditDialog } from './patient-edit.component';

import {
    MatLegacyDialogRef as MatDialogRef,
    MatLegacyDialog as MatDialog,
    MatLegacyDialogModule as MatDialogModule,
    MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';
import { PatientStatusModule } from '../patient-status/patient-status.module';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DropdownService } from '../../services/dropdown/dropdown.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DatePipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('PatientEditDialog', () => {
    let component: PatientEditDialog;
    let fixture: ComponentFixture<PatientEditDialog>;

    const mockDialogRef = {
        open: jasmine.createSpy('open'),
        close: jasmine.createSpy('close'),
    };

    const dialogData = {};

    let dialog: MatDialogRef<PatientEditDialog>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                MatDialogModule,
                PatientStatusModule,
                HttpClientTestingModule,
                BrowserAnimationsModule,
            ],
            providers: [
                DropdownService,
                DatePipe,
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: dialogData,
                },
                {
                    provide: MatDialogRef,
                    useValue: mockDialogRef,
                },
            ],
            declarations: [PatientEditDialog],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PatientEditDialog);
        component = fixture.componentInstance;
        dialog = TestBed.get(MatDialog);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
