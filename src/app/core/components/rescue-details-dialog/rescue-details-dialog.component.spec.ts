// import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';

// import { MatDialogRef, MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

// import { RescueDetailsDialogComponent } from './rescue-details-dialog.component';
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { Component } from '@angular/core';

// @Component({
//   selector: 'rescue-details',
//   template: '<p>Mock rescue-details Component</p>'
// })
// class MockRescueDetailsComponent {}

// describe('RescueDetailsDialogComponent', () => {
//   let component: RescueDetailsDialogComponent;
//   let fixture: ComponentFixture<RescueDetailsDialogComponent>;

//   const mockDialogRef = {
//     open: jasmine.createSpy('open'),
//     close: jasmine.createSpy('close')
//   };

//   let emergencyCaseId:number;
//   let emergencyNumber:number;
//   let recordForm:FormGroup;

//   const dialogData = {
//     emergencyCaseId,
//     emergencyNumber,
//     recordForm
//   };

//   let dialog: MatDialogRef<MockRescueDetailsComponent>;

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       imports: [MatDialogModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule,
//         BrowserAnimationsModule],
//       providers: [
//         {
//           provide: MAT_DIALOG_DATA,
//           useValue: dialogData },
//         {
//         provide: MatDialogRef,
//         useValue: mockDialogRef
//       }],
//       declarations: [ RescueDetailsDialogComponent,
//                       MockRescueDetailsComponent ]
//     })
//     .compileComponents();
//   }));

//   beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
//     fixture = TestBed.createComponent(RescueDetailsDialogComponent);
//     component = fixture.componentInstance;

//     recordForm = fb.group({

//       emergencyDetails: fb.group({
//         emergencyCaseId: [1]
//       }),
//       callOutcome: fb.group({
//         callOutcome: ['']
//       })
//     });

//     component.data = {
//       emergencyCaseId,
//       emergencyNumber,
//       recordForm
//     }

//     dialog = TestBed.get(MatDialog);

//     fixture.detectChanges();

//   }));

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });
