import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { CallerDetailsDialogComponent } from './caller-details-dialog.component';

describe('CallerDetailsDialogComponent', () => {
  let component: CallerDetailsDialogComponent;
  let fixture: ComponentFixture<CallerDetailsDialogComponent>;

  const mockDialogRef = {
    open: jasmine.createSpy('open'),
    close: jasmine.createSpy('close'),
};

  const dialogData = {
    assignmentDetails: {
      callerDetails: {
        callerId: 0,
        callerName: "Test McTest",
        callerNumber: "",
        callerAlternativeNumber: ""
      }
    }
  };
  
  let dialog: MatDialogRef<CallerDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        FormsModule, 
        ReactiveFormsModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData }
     ],
      declarations: [ CallerDetailsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CallerDetailsDialogComponent);
    component = fixture.componentInstance;
    dialog = TestBed.get(MatDialog);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
