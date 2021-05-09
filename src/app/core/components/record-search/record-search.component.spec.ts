import { ComponentFixture, TestBed, inject, waitForAsync } from '@angular/core/testing';

import { RecordSearchComponent } from './record-search.component';
import { PatientEditDialog } from '../patient-edit/patient-edit.component';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';

import {
    MatDialog,
    MatDialogRef,
    MAT_DIALOG_DATA,
    MatDialogModule,
} from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Overlay } from '@angular/cdk/overlay';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { routes } from 'src/app/app-routing.module';
import { SearchFieldComponent } from '../search-field/search-field.component';

describe('RecordSearchComponent', () => {
    let component: RecordSearchComponent;
    let fixture: ComponentFixture<RecordSearchComponent>;

    const mockDialogRef = {
        open: jasmine.createSpy('open'),
        close: jasmine.createSpy('close'),
    };

    const dialogData = {};

    let dialog: MatDialogRef<PatientEditDialog>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                FormsModule,
                ReactiveFormsModule,
                MaterialModule,
                MatDialogModule,
                BrowserAnimationsModule,
                RouterTestingModule.withRoutes(routes),
            ],
            providers: [
                MatDialog,
                Overlay,
                DatePipe,
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: dialogData,
                },
                {
                    provide: MatDialogRef,
                    useValue: mockDialogRef,
                }
            ],
            declarations: [
                RecordSearchComponent,
                SearchFieldComponent
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    }));

    beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
        fixture = TestBed.createComponent(RecordSearchComponent);
        component = fixture.componentInstance;
        dialog = TestBed.get(MatDialog);
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
