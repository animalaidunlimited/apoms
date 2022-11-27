import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyDialog as MatDialog, MatLegacyDialogModule as MatDialogModule, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material-module';
import { ReleaseAssignComponent } from '../release-assign/release-assign.component';

import { ReleaseAssignDialogComponent } from './release-assign-dialog.component';

@Component({
  selector: 'app-release-assign-dialog',
  template: '<p>Mock release-assign Component</p>'
})
class MockReleaseAssignDialogComponent {}

describe('ReleaseAssignDialogComponent', () => {
  let component: ReleaseAssignDialogComponent;
  let fixture: ComponentFixture<ReleaseAssignDialogComponent>;

  const mockDialogRef = {
    open: jasmine.createSpy('open'),
    close: jasmine.createSpy('close')
  };

  const dialogData = {
    caseDetails: { releaseId: 0,
    emergencyCaseId:  0,
    releaseType: 0,
    Releaser1: 0,
    Releaser2: 0,
    releaseBeginDate: '',
    releaseEndDate: '',
    pickupDate: ''}
  };

  let dialog: MatDialogRef<MockReleaseAssignDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        ReleaseAssignDialogComponent,
        ReleaseAssignComponent,
        MockReleaseAssignDialogComponent
       ],
      imports: [
        MatDialogModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        MaterialModule,
        BrowserAnimationsModule
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData },
        {
        provide: MatDialogRef,
        useValue: mockDialogRef
      }],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseAssignDialogComponent);
    component = fixture.componentInstance;


    dialog = TestBed.get(MatDialog);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
