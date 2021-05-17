import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DriverViewPageRoutingModule } from './driver-view-page-routing.module';
import { VehileListPageComponent } from './pages/vehile-list-page/vehile-list-page.component';
import { MaterialModule } from 'src/app/material-module';
import { MatFormFieldModule } from '@angular/material/form-field';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DriverViewPageRoutingModule,
    MaterialModule
  ]
})
export class DriverViewPageModule { }
