import { MaterialModule } from 'src/app/material-module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Overlay, OverlayModule } from '@angular/cdk/overlay';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CensusRecordComponent } from 'src/app/modules/census/components/census-record/census-record.component';

import { UpdateCensusDialogComponent } from './update-census-dialog.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

describe('UpdateCensusDialogComponent', () => {
  let component: UpdateCensusDialogComponent;
  let fixture: ComponentFixture<UpdateCensusDialogComponent>;

  const mockDialogRef = {
    open: jasmine.createSpy('open'),
    close: jasmine.createSpy('close'),
};

const dialogData = {
  censusUpdateDate : new Date()
};

let dialog: MatDialogRef<UpdateCensusDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        BrowserAnimationsModule,
        OverlayModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        MaterialModule,
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        MatDialog,
        Overlay,
        {
            provide: MAT_DIALOG_DATA,
            useValue: dialogData,
        },
        {
            provide: MatDialogRef,
            useValue: mockDialogRef,
        },
    ],
      declarations: [ 
        UpdateCensusDialogComponent,
        CensusRecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateCensusDialogComponent);
    component = fixture.componentInstance;
    dialog = TestBed.get(MatDialog);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
