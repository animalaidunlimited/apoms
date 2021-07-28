import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriverViewPageRoutingModule } from './driver-view-page-routing.module';
import { MaterialModule } from 'src/app/material-module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { DriverViewAssignmentComponent } from './components/driver-view-assignment/driver-view-assignment.component';

import { VehicleListPageModule } from './pages/vehicle-list-page/vehicle-list-page.module';

import { DriverViewIconsComponent } from './components/driver-view-icons/driver-view-icons.component';
import { CallerDetailsDialogComponent } from './dialogs/caller-details-dialog/caller-details-dialog.component';

import { LocationDialogComponent } from './dialogs/location-dialog/location-dialog.component';
import { DriverActionDialogComponent } from './dialogs/driver-action-dialog/driver-action-dialog.component';
import { CaseLocationComponent } from './components/case-location/case-location.component';
@NgModule({
  declarations: [ 
    DriverViewAssignmentComponent, 
    DriverViewIconsComponent, 
    CallerDetailsDialogComponent, 
    LocationDialogComponent, 
    DriverActionDialogComponent, 
    CaseLocationComponent],
  imports: [
    CommonModule,
    DriverViewPageRoutingModule,
    MaterialModule,
    DragDropModule,
    VehicleListPageModule
  ]
})
export class DriverViewPageModule { }
