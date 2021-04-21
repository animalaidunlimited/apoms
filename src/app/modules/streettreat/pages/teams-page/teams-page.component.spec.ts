import { MaterialModule } from 'src/app/material-module';
import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MatDialogModule,
                OverlayModule,
                FormsModule,
                MaterialModule,
                ReactiveFormsModule,
                BrowserAnimationsModule],
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
            declarations: [TeamsPageComponent, MockConfirmationDialogComponent]

        }).compileComponents();
    });

    beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
        fixture = TestBed.createComponent(TeamsPageComponent);
        component = fixture.componentInstance;

        dialog = TestBed.get(MatDialog);

        component.teamDetails.reset();

        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Invalid form - team name is required', () => {
        component.teamDetails.get('TeamName')?.setValue(null);
        expect(component.teamDetails.valid).toBe(false);
    });

    it('Invalid form - Capacity is required', () => {
        component.teamDetails.get('Capacity')?.setValue(null);
        expect(component.teamDetails.valid).toBe(false);
    });
});