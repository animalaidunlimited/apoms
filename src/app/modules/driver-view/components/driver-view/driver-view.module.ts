import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DriverViewRoutingModule } from './driver-view-routing.module';
import { DriverViewComponent } from './driver-view.component';
import { MaterialModule } from 'src/app/material-module';
import { DriverViewAssignmentComponent } from '../driver-view-assignment/driver-view-assignment.component';


@NgModule({
  declarations: [DriverViewComponent, DriverViewAssignmentComponent],
  imports: [
    CommonModule,
    DriverViewRoutingModule,
    MaterialModule,
  ]
})
export class DriverViewModule { }
