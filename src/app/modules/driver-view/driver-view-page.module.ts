import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriverViewPageRoutingModule } from './driver-view-page-routing.module';
import { MaterialModule } from 'src/app/material-module';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { DriverViewModule } from './components/driver-view/driver-view.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DriverViewPageRoutingModule,
    MaterialModule,
    DragDropModule,
    DriverViewModule
  ]
})
export class DriverViewPageModule { }
