import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StaffRotaRoutingModule } from './staff-rota-routing.module';
import { MaterialModule } from 'src/app/material-module';
import { StaffRotaPageComponent } from './pages/staff-rota-page.component';
import { RotationPeriodComponent } from './components/rotation-period/rotation-period.component';


@NgModule({
  declarations: [
    StaffRotaPageComponent,
    RotationPeriodComponent
  ],
  imports: [
    CommonModule,
    StaffRotaRoutingModule,
    MaterialModule
  ]
})
export class StaffRotaModule { }
