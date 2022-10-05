import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RotaSettingsComponent } from './rota-settings.component';
import { MaterialModule } from 'src/app/material-module';
import { RotaSettingsComponentRoutingModule } from './rota-settings-routing.module';

@NgModule({
  imports: [
    CommonModule,
    RotaSettingsComponentRoutingModule,
    MaterialModule
  ],
  declarations: [RotaSettingsComponent]
})
export class RotaSettingsModule { }
