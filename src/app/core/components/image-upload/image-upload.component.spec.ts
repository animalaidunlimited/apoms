import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ImageUploadDialog } from './image-upload.component';
import {
    MatLegacyDialogRef as MatDialogRef,
    MatLegacyDialog as MatDialog,
    MatLegacyDialogModule as MatDialogModule,
} from '@angular/material/legacy-dialog';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ImageUploadDialog', () => {
    let component: ImageUploadDialog;
    let fixture: ComponentFixture<ImageUploadDialog>;

    const mockDialogRef = {
        close: jasmine.createSpy('close'),
    };

    let dialog: MatDialogRef<ImageUploadDialog>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: mockDialogRef,
                },
            ],
            declarations: [ImageUploadDialog],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ImageUploadDialog);
        component = fixture.componentInstance;
        dialog = TestBed.get(MatDialog);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
