import { ComponentFixture, TestBed, inject, waitForAsync } from '@angular/core/testing';

import { AnimalHeaderComponent } from './animal-header.component';

import {
    MatDialog,
    MatDialogRef,
    MAT_DIALOG_DATA,
    MatDialogModule,
} from '@angular/material/dialog';
import { ImageUploadDialog } from 'src/app/core/components/image-upload/image-upload.component';
import { Overlay } from '@angular/cdk/overlay';
import { MaterialModule } from 'src/app/material-module';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { AngularFireModule } from '@angular/fire';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';

describe('AnimalHeaderComponent', () => {
    let component: AnimalHeaderComponent;
    let fixture: ComponentFixture<AnimalHeaderComponent>;

    const mockDialogRef = {
        open: jasmine.createSpy('open'),
        close: jasmine.createSpy('close'),
    };

    const dialogData = {};

    let dialog: MatDialogRef<ImageUploadDialog>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MaterialModule,
                MatDialogModule,
                FormsModule,
                ReactiveFormsModule,
                AngularFireMessagingModule,
                AngularFireModule.initializeApp(environment.firebase)
            ],
            providers: [
                MatDialog,
                DatePipe,
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
            declarations: [AnimalHeaderComponent],
        }).compileComponents();
    }));

    beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
        fixture = TestBed.createComponent(AnimalHeaderComponent);
        component = fixture.componentInstance;

        component.recordForm = fb.group({
            emergencyDetails: fb.group({
                emergencyCaseId: [1],
                updateTime: [''],
            }),
            patientDetails: fb.group({
                tagNumber: [''],
                currentLocation: [''],
            }),
            patientStatus: fb.group({
                status: [''],
            }),
        });

        dialog = TestBed.get(MatDialog);

        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
