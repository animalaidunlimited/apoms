import {
    async,
    ComponentFixture,
    TestBed,
    inject,
} from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { SurgeryDetailsComponent } from './surgery-details.component';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import {
    MatDialog,
    MatDialogModule,
    MAT_DIALOG_DATA,
    MatDialogRef,
} from '@angular/material/dialog';
import { AddSurgeryDialogComponent } from '../add-surgery-dialog/add-surgery-dialog.component';

describe('SurgeryDetailsComponent', () => {
    let component: SurgeryDetailsComponent;
    let fixture: ComponentFixture<SurgeryDetailsComponent>;
    const mockDialogRef = {
        open: jasmine.createSpy('open'),
        close: jasmine.createSpy('close'),
    };
    const dialogData = {};
    let dialog: MatDialogRef<AddSurgeryDialogComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MatDialogModule,
                FormsModule,
                ReactiveFormsModule,
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
            declarations: [SurgeryDetailsComponent],
        }).compileComponents();
    }));

    beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
        fixture = TestBed.createComponent(SurgeryDetailsComponent);
        component = fixture.componentInstance;
        const dialog = TestBed.get(MatDialog);
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
