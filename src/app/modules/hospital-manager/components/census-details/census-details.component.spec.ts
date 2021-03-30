import { OverlayModule, OVERLAY_PROVIDERS } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UpdateCensusDialogComponent } from '../update-census-dialog/update-census-dialog.component';

import { CensusDetailsComponent } from './census-details.component';

describe('CensusDetailsComponent', () => {
    let component: CensusDetailsComponent;
    let fixture: ComponentFixture<CensusDetailsComponent>;

    const mockDialogRef = {
        open: jasmine.createSpy('open'),
        close: jasmine.createSpy('close'),
    };

    const dialogData = {};

    let dialog: MatDialogRef<UpdateCensusDialogComponent>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                BrowserAnimationsModule,
                MatDialogModule,
                OverlayModule
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
            declarations: [CensusDetailsComponent],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CensusDetailsComponent);
        component = fixture.componentInstance;
        dialog = TestBed.get(MatDialog);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
