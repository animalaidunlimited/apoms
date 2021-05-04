 import { ComponentFixture, TestBed, inject, waitForAsync } from '@angular/core/testing';

 import { MatDialogRef, MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

 import { RescueDetailsDialogComponent } from './rescue-details-dialog.component';
 import { HttpClientTestingModule } from '@angular/common/http/testing';
 import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
 import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
 import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

 @Component({
   selector: 'rescue-details',
   template: '<p>Mock rescue-details Component</p>'
 })
 class MockRescueDetailsComponent {}

 describe('RescueDetailsDialogComponent', () => {
   let component: RescueDetailsDialogComponent;
   let fixture: ComponentFixture<RescueDetailsDialogComponent>;

   const mockDialogRef = {
     open: jasmine.createSpy('open'),
     close: jasmine.createSpy('close')
   };

   const emergencyCaseId = 0;
   const emergencyNumber = 0;
   let recordForm:FormGroup = new FormGroup({});

   const dialogData = {
     emergencyCaseId,
     emergencyNumber,
     recordForm
   };

   let dialog: MatDialogRef<MockRescueDetailsComponent>;

   beforeEach(waitForAsync(() => {
     TestBed.configureTestingModule({
       imports: [MatDialogModule,
        FormsModule, ReactiveFormsModule, HttpClientTestingModule,
         BrowserAnimationsModule],
       providers: [
        MatSnackBar,
         {
           provide: MAT_DIALOG_DATA,
           useValue: dialogData },
         {
         provide: MatDialogRef,
         useValue: mockDialogRef
       }],
       declarations: [ RescueDetailsDialogComponent,
                       MockRescueDetailsComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
     })
     .compileComponents();
   }));

   beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
     fixture = TestBed.createComponent(RescueDetailsDialogComponent);
     component = fixture.componentInstance;

     recordForm = fb.group({

       emergencyDetails: fb.group({
         emergencyCaseId: [1]
       }),
       callOutcome: fb.group({
         callOutcome: ['']
       })
     });
     dialog = TestBed.get(MatDialog);

     fixture.detectChanges();

   }));

   it('should create', () => {
     expect(component).toBeTruthy();
   });
 });
