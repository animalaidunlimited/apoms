import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VehicleListPageRoutingModule } from './vehicle-list-page-routing.module';
import { MaterialModule } from 'src/app/material-module';
import { VehicleListPageComponent } from './vehicle-list-page.component';

@NgModule({
  declarations: [VehicleListPageComponent],
  imports: [
    CommonModule,
    VehicleListPageRoutingModule,
    MaterialModule
  ]
})
export class VehicleListPageModule { }
