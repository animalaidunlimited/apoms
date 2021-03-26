import { OverlayModule } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TeamsPageComponent } from 'src/app/modules/streettreat/pages/teams-page/teams-page.component';
import { SnackbarService } from '../snackbar/snackbar.service';

import { TeamDetailsService } from './team-details.service';

@Component({
    selector: 'confirmation-dialog',
    template: '<p>Mock confirmation-dialog Component</p>'
  })
  class MockConfirmationDialogComponent {}

describe('TeamDetailsService', () => {
    let service: TeamDetailsService;

    const mockDialogRef = {
        open: jasmine.createSpy('open'),
        close: jasmine.createSpy('close')
      };


    const dialogData = {};

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ HttpClientTestingModule ],
            providers: [TeamDetailsService]
        });
    });

    it('should be created', () => {
        service = TestBed.inject(TeamDetailsService);
        expect(service).toBeTruthy();
    });

});
