import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ConfirmationDialog } from 'src/app/core/components/confirm-dialog/confirmation-dialog.component';

import { TeamsPageComponent } from './teams-page.component';

@Component({
    selector: 'confirmation-dialog',
    template: '<p>Mock confirmation-dialog Component</p>'
  })
  class MockConfirmationDialogComponent {}
  
describe('TeamsPageComponent', () => {
    let component: TeamsPageComponent;
    let fixture: ComponentFixture<TeamsPageComponent>;

    const mockDialogRef = {
        open: jasmine.createSpy('open'),
        close: jasmine.createSpy('close')
      };

    let dialog: MatDialogRef<MockConfirmationDialogComponent>;

    const dialogData = {};

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [TeamsPageComponent],
            providers: [
                MatSnackBar,
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: dialogData },
                  {
                  provide: MatDialogRef,
                  useValue: mockDialogRef
                }
            ],
            imports: [HttpClientTestingModule,
                MatDialogModule,
                OverlayModule,
                FormsModule,
                ReactiveFormsModule,
                BrowserAnimationsModule]
        }).compileComponents();
    }));

    beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
        fixture = TestBed.createComponent(TeamsPageComponent);
        component = fixture.componentInstance;

        dialog = TestBed.get(MatDialog);

        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
