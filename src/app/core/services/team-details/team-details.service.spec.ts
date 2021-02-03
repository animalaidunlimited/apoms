import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TeamsPageComponent } from 'src/app/modules/street-treat/pages/teams-page/teams-page.component';
import { SnackbarService } from '../snackbar/snackbar.service';

import { TeamDetailsService } from './team-details.service';

@Component({
    selector: 'confirmation-dialog',
    template: '<p>Mock confirmation-dialog Component</p>'
  })
  class MockConfirmationDialogComponent {}

describe('TeamDetailsService', () => {
    let service: TeamDetailsService;
    let snackbar: SnackbarService;
    let component: TeamsPageComponent;
    let fixture: ComponentFixture<TeamsPageComponent>;

    const mockDialogRef = {
        open: jasmine.createSpy('open'),
        close: jasmine.createSpy('close')
      };

    let dialog: MatDialogRef<MockConfirmationDialogComponent>;

    const dialogData = {};

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                MatDialogModule,
                FormsModule,
                ReactiveFormsModule,
                HttpClientTestingModule,
                OverlayModule
            ],
            declarations: [TeamsPageComponent],
            providers: [MatSnackBar,
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: dialogData },
                  {
                  provide: MatDialogRef,
                  useValue: mockDialogRef
                }]
        });
    });

    beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
        service = TestBed.inject(TeamDetailsService);
        fixture = TestBed.createComponent(TeamsPageComponent);
        component = fixture.componentInstance;

        dialog = TestBed.get(MatDialog);

        fixture.detectChanges();
    }));
    afterEach(function(done) {
        component.teamDetails.reset();
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
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
