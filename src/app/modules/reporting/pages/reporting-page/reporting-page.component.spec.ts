import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'src/app/material-module';
import { TreatmentListComponent } from '../../../treatment-list/components/treatment-list/treatment-list.component';

import { ReportingPageComponent } from './reporting-page.component';

describe('ReportingPageComponent', () => {
    let component: ReportingPageComponent;
    let fixture: ComponentFixture<ReportingPageComponent>;

    const mockDialogRef = {
        open: jasmine.createSpy('open'),
        close: jasmine.createSpy('close'),
    };

    const dialogData = {areaName : 'A-Kennel'};

    let dialog: MatDialogRef<TreatmentListComponent>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MatDialogModule,
                FormsModule,
                MaterialModule,
                ReactiveFormsModule,
                RouterTestingModule,
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
    });

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
