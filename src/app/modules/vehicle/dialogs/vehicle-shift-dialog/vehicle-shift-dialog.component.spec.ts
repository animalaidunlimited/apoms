import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { VehicleShiftDialogComponent } from './vehicle-shift-dialog.component';
import { VehicleService } from '../../services/vehicle.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';

import { MaterialModule } from '../../../../material-module';
import { DatePipe } from '@angular/common';
import { MatLegacyDialogModule as MatDialogModule, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
describe('VehicleShiftDialogComponent', () => {
  let component: VehicleShiftDialogComponent;
  let fixture: ComponentFixture<VehicleShiftDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:[
        HttpClientTestingModule,
        MaterialModule,
        MatDialogModule,
        BrowserAnimationsModule
      ],
      providers:[
        VehicleService,
        SnackbarService,
        DatePipe,
          {
            provide: MatDialogRef,
            useValue: {}
          },
          { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
      declarations: [ VehicleShiftDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VehicleShiftDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
