import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleStaffAssignerComponent } from './vehicle-staff-assigner.component';
import { MaterialModule } from 'src/app/material-module';
import { VehicleStaffAssignerRoutingModule } from './vehicle-staff-assigner-routing.module';



@NgModule({
  declarations: [VehicleStaffAssignerComponent],
  imports: [
    CommonModule,
    VehicleStaffAssignerRoutingModule,
    MaterialModule
  ]
})
export class VehicleStaffAssignerModule { }
