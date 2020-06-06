import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsPageRoutingModule } from './settings-page-routing.module';
import { SettingsPageComponent } from './settings-page.component';

@NgModule({
    declarations: [SettingsPageComponent],
    imports: [CommonModule, SettingsPageRoutingModule],
})
export class SettingsPageModule {}
