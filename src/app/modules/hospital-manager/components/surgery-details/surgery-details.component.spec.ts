import { ComponentFixture, TestBed, inject, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SurgeryDetailsComponent } from './surgery-details.component';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import {
    MatLegacyDialog as MatDialog,
    MatLegacyDialogModule as MatDialogModule,
    MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
    MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';
import { AddSurgeryDialogComponent } from '../add-surgery-dialog/add-surgery-dialog.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MaterialModule } from 'src/app/material-module';

describe('SurgeryDetailsComponent', () => {
    let component: SurgeryDetailsComponent;
    let fixture: ComponentFixture<SurgeryDetailsComponent>;
    const mockDialogRef = {
        open: jasmine.createSpy('open'),
        close: jasmine.createSpy('close'),
    };
    const dialogData = {};

    let dialog: MatDialogRef<AddSurgeryDialogComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MatDialogModule,
                FormsModule,
                ReactiveFormsModule,
                MaterialModule
            ],
            providers: [
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: dialogData,
                },
                {
                    provide: MatDialogRef,
                    useValue: mockDialogRef,
                }
            ],
            declarations: [SurgeryDetailsComponent],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    }));

    beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
        fixture = TestBed.createComponent(SurgeryDetailsComponent);
        component = fixture.componentInstance;
        const dialog = TestBed.get(MatDialog);
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
