import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AssignReleaseDialogComponent } from './assign-release-dialog.component';

@Component({
  selector: 'app-assign-release-dialog',
  template: '<p>Mock assign-release Component</p>'
})
class MockAssignReleaseDialogComponent {}

describe('AssignReleaseDialogComponent', () => {
  let component: AssignReleaseDialogComponent;
  let fixture: ComponentFixture<AssignReleaseDialogComponent>;

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

  let dialog: MatDialogRef<MockAssignReleaseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignReleaseDialogComponent,
        MockAssignReleaseDialogComponent
       ],
      imports: [MatDialogModule],
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
    fixture = TestBed.createComponent(AssignReleaseDialogComponent);
    component = fixture.componentInstance;


    dialog = TestBed.get(MatDialog);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
