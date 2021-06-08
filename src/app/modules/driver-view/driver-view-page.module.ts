import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DriverViewPageRoutingModule } from './driver-view-page-routing.module';
import { VehileListPageComponent } from './pages/vehile-list-page/vehile-list-page.component';
import { MaterialModule } from 'src/app/material-module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { VehicleAssignmentPageComponent } from './pages/vehicle-assignment-page/vehicle-assignment-page.component';
import {DragDropModule} from '@angular/cdk/drag-drop';


@NgModule({
  declarations: [VehicleAssignmentPageComponent],
  imports: [
    CommonModule,
    DriverViewPageRoutingModule,
    MaterialModule,
    DragDropModule
  ]
})
export class DriverViewPageModule { }
