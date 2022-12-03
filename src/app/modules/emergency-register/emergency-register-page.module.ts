import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmergencyRegisterPageRoutingModule } from './emergency-register-page-routing.module';
import { EmergencyRegisterPageComponent } from './pages/emergency-register-page.component';

import { MaterialModule } from '../../material-module';
import { TabBarModule } from './components/tab-bar/tab-bar.module';
import { AddSearchMediaMatDialogModule } from './components/add-search-media-dialog/add-search-media-dialog.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
    declarations: [
        EmergencyRegisterPageComponent
    ],
    imports: [
        CommonModule,
        EmergencyRegisterPageRoutingModule,
        TabBarModule,
        MaterialModule,
        AddSearchMediaMatDialogModule,
        MatProgressSpinnerModule
    ],
    exports: [],
})

export class EmergencyRegisterPageModule {}
