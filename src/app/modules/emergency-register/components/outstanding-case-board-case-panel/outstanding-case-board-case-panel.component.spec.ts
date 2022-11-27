import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { MatLegacyDialogModule as MatDialogModule, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedPipesModule } from 'src/app/shared-pipes.module';

import { OutstandingCaseBoardCasePanelComponent } from './outstanding-case-board-case-panel.component';

describe('OutstandingCaseBoardCasePanelComponent', () => {
    let component: OutstandingCaseBoardCasePanelComponent;
    let fixture: ComponentFixture<OutstandingCaseBoardCasePanelComponent>;
    const formBuilder: UntypedFormBuilder = new UntypedFormBuilder();
    const dialogData = {};

    const mockDialogRef = {
      open: jasmine.createSpy('open'),
      close: jasmine.createSpy('close'),
  };

    beforeEach(async(() => {

        TestBed.configureTestingModule({
            declarations: [ OutstandingCaseBoardCasePanelComponent ],
            imports:[ MatDialogModule,
                CommonModule,
                HttpClientTestingModule,
                SharedPipesModule,
                BrowserAnimationsModule],
            providers:[
                MatSnackBar,
                { provide: MatDialogRef, useValue: mockDialogRef },
              { provide: MAT_DIALOG_DATA, useValue: dialogData },
              { provide: UntypedFormBuilder, useValue: formBuilder },
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(OutstandingCaseBoardCasePanelComponent);
        component = fixture.componentInstance;

        component.outstandingCase = {
            actionStatusId: 0,
            ambulanceAction: "",
            ambulanceAssignmentTime: new Date(),
            rescueAmbulanceId: 0,
            releaseAmbulanceId: 0,
            callDateTime: "",
            callerDetails: [],
            emergencyCaseId: 0,
            emergencyCode: "",
            emergencyCodeId: 0,
            emergencyNumber: 0,
            latLngLiteral: {lat: 0, lng: 0},
            location: "",
            moved: false,
            patients: [],
            releasePickupDate: "",
            releaseBeginDate: "",
            releaseEndDate: "",
            releaseDetailsId: 0,
            releaseType: "",
            patientId: 0,
            releaseRequestDate: "",
            rescueTime:"",
            searchCandidate: true
        }

        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});