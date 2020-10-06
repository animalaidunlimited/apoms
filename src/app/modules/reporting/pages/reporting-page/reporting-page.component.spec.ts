import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PatientDetailsDialogComponent } from 'apoms/src/app/modules/reporting/components/patient-details-dialog/patient-details-dialog.component';

import { ReportingPageComponent } from './reporting-page.component';

describe('ReportingPageComponent', () => {
    let component: ReportingPageComponent;
    let fixture: ComponentFixture<ReportingPageComponent>;

    const mockDialogRef = {
        open: jasmine.createSpy('open'),
        close: jasmine.createSpy('close'),
    };

    const dialogData = {areaName : 'A-Kennel'};

    let dialog: MatDialogRef<PatientDetailsDialogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MatDialogModule,
                FormsModule,
                ReactiveFormsModule,
                OverlayModule,
                BrowserAnimationsModule
            ],
            providers: [
                MatDialog,
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: dialogData,
                },
                {
                    provide: MatDialogRef,
                    useValue: mockDialogRef,
                },
            ],
            declarations: [ReportingPageComponent],
        }).compileComponents();
    }));

    beforeEach(inject([FormBuilder], (fb: FormBuilder) => {

        fixture = TestBed.createComponent(ReportingPageComponent);
        component = fixture.componentInstance;
        dialog = TestBed.get(MatDialog);
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
