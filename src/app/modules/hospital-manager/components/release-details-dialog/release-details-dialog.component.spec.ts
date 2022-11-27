import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder } from '@angular/forms';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from 'src/app/auth/auth.service';
import { MaterialModule } from 'src/app/material-module';

import { ReleaseDetailsDialogComponent } from './release-details-dialog.component';


@Component({
  selector: 'app-release-details-dialog',
  template: '<p>Mock release-details Component</p>'
})
class MockReleaseDetailsDialogComponent {}

describe('ReleaseDetailsDialogComponent', () => {
  let component: ReleaseDetailsDialogComponent;
  let fixture: ComponentFixture<ReleaseDetailsDialogComponent>;
  let authService: AuthService;

  const mockDialogRef = {
    open: jasmine.createSpy('open'),
    close: jasmine.createSpy('close')
  };

  const dialogData = {
    emergencyCaseId: 0,
    tagNumber: '',
    patientId: 0
  };

  const formBuilder: UntypedFormBuilder = new UntypedFormBuilder();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
          HttpClientTestingModule,
          BrowserAnimationsModule,
          MaterialModule
         ],
      declarations: [ ReleaseDetailsDialogComponent ],
      providers: [
        MatSnackBar,
        { provide: UntypedFormBuilder, useValue: formBuilder },
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

  beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
    fixture = TestBed.createComponent(ReleaseDetailsDialogComponent);
    authService = TestBed.inject(AuthService);
    component = fixture.componentInstance;

    authService.mockLogin('user','user');

    fixture.detectChanges();
}));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
