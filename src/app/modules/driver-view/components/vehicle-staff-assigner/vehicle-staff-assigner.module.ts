import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleStaffAssignerComponent } from './vehicle-staff-assigner.component';
import { MaterialModule } from 'src/app/material-module';
import { VehicleStaffAssignerRoutingModule } from './vehicle-staff-assigner-routing.module';
import { VehicleShiftComponent } from '../vehicle-shift/vehicle-shift.component';
import { VehicleShiftDialogComponent } from '../vehicle-shift-dialog/vehicle-shift-dialog.component';



@NgModule({
  declarations: [
    VehicleStaffAssignerComponent,
    VehicleShiftComponent,
    VehicleShiftDialogComponent
  ],
  imports: [
    CommonModule,
    VehicleStaffAssignerRoutingModule,
    MaterialModule
  ]
})
export class VehicleStaffAssignerModule { }
