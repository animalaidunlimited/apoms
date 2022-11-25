import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyRotaComponent } from './daily-rota.component';
import { MaterialModule } from 'src/app/material-module';
import { DailyRotaComponentRoutingModule } from './daily-rota-routing.module';
import { DailyRotaDayComponent } from '../../components/daily-rota-day/daily-rota-day.component';
import { UserAutoCompleteModule } from '../../components/user-autocomplete/user-autocomplete.module';
import { AreaStaffCoverageComponent } from './../../components/area-staff-coverage/area-staff-coverage.component';

@NgModule({
  imports: [
  CommonModule,
    DailyRotaComponentRoutingModule,
    MaterialModule,
    UserAutoCompleteModule
  ],
  declarations: [
    DailyRotaComponent,
    DailyRotaDayComponent,
    AreaStaffCoverageComponent
  ]
})
export class DailyRotaModule { }
