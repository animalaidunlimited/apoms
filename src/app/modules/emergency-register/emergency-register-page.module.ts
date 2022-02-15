import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmergencyRegisterPageRoutingModule } from './emergency-register-page-routing.module';
import { EmergencyRegisterPageComponent } from './pages/emergency-register-page.component';

import { MaterialModule } from '../../material-module';
import { TabBarModule } from './components/tab-bar/tab-bar.module';
import { AddSearchMediaDialogModule } from './components/add-search-media-dialog/add-search-media-dialog.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GalleryWrapperModule } from 'src/app/core/components/media/media-gallery-wrapper/media-gallery-wrapper.module';


@NgModule({
    declarations: [
        EmergencyRegisterPageComponent
    ],
    imports: [
        CommonModule,
        EmergencyRegisterPageRoutingModule,
        TabBarModule,
        MaterialModule,
        AddSearchMediaDialogModule,
        MatProgressSpinnerModule
    ],
    exports: [],
})

export class EmergencyRegisterPageModule {}
