import {
    async,
    ComponentFixture,
    TestBed,
    inject,
} from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { AddSurgeryDialogComponent } from './add-surgery-dialog.component';
import {
    MatDialogRef,
    MatDialog,
    MatDialogModule,
    MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AddSurgeryDialogComponent', () => {
    let component: AddSurgeryDialogComponent;
    let fixture: ComponentFixture<AddSurgeryDialogComponent>;
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
            declarations: [AddSurgeryDialogComponent],
        }).compileComponents();
    }));

    beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
        fixture = TestBed.createComponent(AddSurgeryDialogComponent);
        component = fixture.componentInstance;
        dialog = TestBed.get(MatDialog);
        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
