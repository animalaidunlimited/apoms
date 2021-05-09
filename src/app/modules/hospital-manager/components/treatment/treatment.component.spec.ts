import { MaterialModule } from 'src/app/material-module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TreatmentRecordComponent } from 'src/app/core/components/treatment-record/treatment-record.component';
import { TreatmentService } from 'src/app/core/services/treatment/treatment.service';

import { TreatmentComponent } from './treatment.component';

describe('TreatmentComponent', () => {
  let component: TreatmentComponent;
  let service: TreatmentService;
  let fixture: ComponentFixture<TreatmentComponent>;

  const mockDialogRef = {
    open: jasmine.createSpy('open'),
    close: jasmine.createSpy('close')
  };

  const dialogData = {};

  let dialog: MatDialogRef<TreatmentRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ MatDialogModule, HttpClientTestingModule, MaterialModule ],
      declarations: [ TreatmentComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    service = TestBed.inject(TreatmentService);
    fixture = TestBed.createComponent(TreatmentComponent);
    component = fixture.componentInstance;

    dialog = TestBed.get(MatDialog);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
