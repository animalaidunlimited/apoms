import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ReleaseDetailsDialogComponent } from './release-details-dialog.component';


@Component({
  selector: 'app-release-details-dialog',
  template: '<p>Mock release-details Component</p>'
})
class MockReleaseDetailsDialogComponent {}

describe('ReleaseDetailsDialogComponent', () => {
  let component: ReleaseDetailsDialogComponent;
  let fixture: ComponentFixture<ReleaseDetailsDialogComponent>;

  const mockDialogRef = {
    open: jasmine.createSpy('open'),
    close: jasmine.createSpy('close')
  };

  const dialogData = {
    emergencyCaseId: 0,
    tagNumber: '',
    patientId: 0
  };


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReleaseDetailsDialogComponent ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData },
        {
        provide: MatDialogRef,
        useValue: mockDialogRef
      }]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
