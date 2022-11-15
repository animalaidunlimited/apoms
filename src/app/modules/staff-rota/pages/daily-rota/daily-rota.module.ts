import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyRotaComponent } from './daily-rota.component';
import { MaterialModule } from 'src/app/material-module';
import { DailyRotaComponentRoutingModule } from './daily-rota-routing.module';
import { DailyRotaDayComponent } from '../../components/daily-rota-day/daily-rota-day.component';

@NgModule({
  imports: [
    CommonModule,
    DailyRotaComponentRoutingModule,
    MaterialModule
  ],
  declarations: [
    DailyRotaComponent,
    DailyRotaDayComponent
  ]
})
export class DailyRotaModule { }
