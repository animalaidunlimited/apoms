import { ComponentFixture, TestBed, inject, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { AddSurgeryDialogComponent } from './add-surgery-dialog.component';
import {
    MatDialogRef,
    MatDialog,
    MatDialogModule,
    MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material-module';
import { SurgeryRecordComponent } from 'src/app/modules/surgery-register/components/surgery-record.component';

describe('AddSurgeryDialogComponent', () => {
    let component: AddSurgeryDialogComponent;
    let fixture: ComponentFixture<AddSurgeryDialogComponent>;
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
                MaterialModule,
                BrowserAnimationsModule
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
            declarations: [
                AddSurgeryDialogComponent,
                SurgeryRecordComponent
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    }));

    beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
        fixture = TestBed.createComponent(AddSurgeryDialogComponent);
        component = fixture.componentInstance;
        dialog = TestBed.get(MatDialog);
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
