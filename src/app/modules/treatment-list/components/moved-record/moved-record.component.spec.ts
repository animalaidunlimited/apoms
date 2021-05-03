import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material-module';

import { MovedRecordComponent } from './moved-record.component';

describe('MovedRecordComponent', () => {
  let component: MovedRecordComponent;
  let fixture: ComponentFixture<MovedRecordComponent>;

  const formBuilder: FormBuilder = new FormBuilder();

  const mockDialogRef = {
    open: jasmine.createSpy('open'),
    close: jasmine.createSpy('close')
  };

  const dialogData = {};


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        MaterialModule,
        ReactiveFormsModule,
        BrowserAnimationsModule
      ],
      providers: [
        MatSnackBar,
        Overlay,
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData
        },
        {
        provide: MatDialogRef,
        useValue: mockDialogRef
        }
      ],
      declarations: [ MovedRecordComponent ]
    })
    .compileComponents();
  });

  beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
    fixture = TestBed.createComponent(MovedRecordComponent);
    component = fixture.componentInstance;

    component.movedRecordsInput = fb.group({
      listType: 'admission',
      movedList: fb.array([])
    });

    component.area = {
      areaId: 2,
      areaName: 'B-Kennel',
      abbreviation: 'B'
    };



    fixture.detectChanges();
  }));


  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
