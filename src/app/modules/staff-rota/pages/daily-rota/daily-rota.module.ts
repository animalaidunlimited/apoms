import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyRotaComponent } from './daily-rota.component';
import { MaterialModule } from 'src/app/material-module';
import { DailyRotaComponentRoutingModule } from './daily-rota-routing.module';

@NgModule({
  imports: [
    CommonModule,
    DailyRotaComponentRoutingModule,
    MaterialModule
  ],
  declarations: [DailyRotaComponent]
})
export class DailyRotaModule { }
