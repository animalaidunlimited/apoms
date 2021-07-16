import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriverViewPageRoutingModule } from './driver-view-page-routing.module';
import { MaterialModule } from 'src/app/material-module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DriverViewAssignmentComponent } from './components/driver-view-assignment/driver-view-assignment.component';
import { VehicleListPageModule } from './pages/vehicle-list-page/vehicle-list-page.module';
import { VehicleShiftDialogComponent } from './components/vehicle-shift-dialog/vehicle-shift-dialog.component';

@NgModule({
  declarations: [ DriverViewAssignmentComponent],
  imports: [
    CommonModule,
    DriverViewPageRoutingModule,
    MaterialModule,
    DragDropModule,
    VehicleListPageModule
  ]
})
export class DriverViewPageModule { }
