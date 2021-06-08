import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DriverViewRoutingModule } from './driver-view-routing.module';
import { DriverViewComponent } from './driver-view.component';
import { MaterialModule } from 'src/app/material-module';


@NgModule({
  declarations: [DriverViewComponent],
  imports: [
    CommonModule,
    DriverViewRoutingModule,
    MaterialModule
  ]
})
export class DriverViewModule { }
