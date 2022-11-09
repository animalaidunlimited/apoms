import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material-module';

import { MovedRecordComponent } from './moved-record.component';

describe('MovedRecordComponent', () => {
  let component: MovedRecordComponent;
  let fixture: ComponentFixture<MovedRecordComponent>;

  const formBuilder: UntypedFormBuilder = new UntypedFormBuilder();

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
      declarations: [ MovedRecordComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
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
