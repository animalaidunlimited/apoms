import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriverViewPageRoutingModule } from './driver-view-page-routing.module';
import { MaterialModule } from 'src/app/material-module';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { VehicleListPageModule } from '../vehicle/pages/vehicle-list-page/vehicle-list-page.module';

import { DriverViewModule } from './components/driver-view/driver-view.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DriverViewPageRoutingModule,
    MaterialModule,
    DragDropModule,
    VehicleListPageModule,
    DriverViewModule
  ]
})
export class DriverViewPageModule { }
