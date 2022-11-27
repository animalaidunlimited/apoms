import { ComponentFixture, TestBed, inject, waitForAsync } from '@angular/core/testing';

import { AnimalSelectionComponent } from './animal-selection.component';
import {
    MatLegacyDialogRef as MatDialogRef,
    MatLegacyDialog as MatDialog,
    MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
    MatLegacyDialogModule as MatDialogModule,
} from '@angular/material/legacy-dialog';
import { TagNumberDialog } from '../tag-number-dialog/tag-number-dialog.component';
import { Overlay } from '@angular/cdk/overlay';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, UntypedFormBuilder, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MaterialModule } from 'src/app/material-module';

describe('AnimalSelectionComponent', () => {
    let component: AnimalSelectionComponent;
    let fixture: ComponentFixture<AnimalSelectionComponent>;

    const mockDialogRef = {
        open: jasmine.createSpy('open'),
        close: jasmine.createSpy('close'),
    };

    const dialogData = {};

    let dialog: MatDialogRef<TagNumberDialog>;


    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MatDialogModule,
                BrowserAnimationsModule,
                RouterTestingModule,
                ReactiveFormsModule,
                MaterialModule,
                FormsModule,
                AngularFireMessagingModule,
                AngularFireModule.initializeApp(environment.firebase)
            ],
            providers: [
                DatePipe,
                MatDialog,
                Overlay,
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: dialogData,
                },
                {
                    provide: MatDialogRef,
                    useValue: mockDialogRef,
                },
            ],
            declarations: [AnimalSelectionComponent],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    }));

    beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
        fixture = TestBed.createComponent(AnimalSelectionComponent);
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

        dialog = TestBed.get(MatDialog);
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
