import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VehicleListPageRoutingModule } from './vehicle-list-page-routing.module';
import { MaterialModule } from 'src/app/material-module';
import { VehileListPageComponent } from './vehile-list-page.component';

@NgModule({
  declarations: [VehileListPageComponent],
  imports: [
    CommonModule,
    VehicleListPageRoutingModule,
    MaterialModule
  ]
})
export class VehicleListPageModule { }
