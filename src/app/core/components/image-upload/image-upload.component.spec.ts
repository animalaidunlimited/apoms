import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageUploadDialog } from './image-upload.component';
import {
    MatDialogRef,
    MatDialog,
    MatDialogModule,
} from '@angular/material/dialog';

describe('ImageUploadDialog', () => {
    let component: ImageUploadDialog;
    let fixture: ComponentFixture<ImageUploadDialog>;

    const mockDialogRef = {
        close: jasmine.createSpy('close'),
    };

    let dialog: MatDialogRef<ImageUploadDialog>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: mockDialogRef,
                },
            ],
            declarations: [ImageUploadDialog],
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
