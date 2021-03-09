import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsPageRoutingModule } from './settings-page-routing.module';
import { SettingsPageComponent } from './settings-page.component';
import { MaterialModule } from 'src/app/material-module';

@NgModule({
    declarations: [SettingsPageComponent],
    imports: [  CommonModule,
                SettingsPageRoutingModule,
                MaterialModule
             ],
})
export class SettingsPageModule {}
