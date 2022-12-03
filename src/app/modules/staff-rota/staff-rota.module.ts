import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from 'src/app/material-module';
import { RotationPeriodComponent } from './components/rotation-period/rotation-period.component';
import { StaffRotationPageComponent } from './pages/staff-rotation/staff-rotation-page.component';
import { StaffRotaRoutingModule } from './staff-rota-routing.module';
import { AreaShiftComponent } from './components/area-shift/area-shift.component';

@NgModule({
  declarations: [
    StaffRotationPageComponent,
    RotationPeriodComponent,
    AreaShiftComponent
  ],
  imports: [  
  CommonModule,
    StaffRotaRoutingModule,
    MaterialModule
  ]
})
export class StaffRotaModule { }
