import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef, MatDialogModule, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { TreatmentListComponent } from './treatment-list.component';

describe('TreatmentListComponent', () => {
  let component: TreatmentListComponent;
  let fixture: ComponentFixture<TreatmentListComponent>;

  const mockDialogRef = {
    open: jasmine.createSpy('open'),
    close: jasmine.createSpy('close'),
};

const dialogData = {};

let dialog: MatDialogRef<TreatmentListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        HttpClientTestingModule,
        RouterTestingModule,
        BrowserAnimationsModule
      ],
      providers: [
        MatDialog,
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData,
        },
        {
            provide: MatDialogRef,
            useValue: mockDialogRef,
        },
      ],
      declarations: [ TreatmentListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreatmentListComponent);
    component = fixture.componentInstance;
    dialog = TestBed.get(MatDialog);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
