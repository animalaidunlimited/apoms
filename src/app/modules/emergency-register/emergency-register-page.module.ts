import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmergencyRegisterPageRoutingModule } from './emergency-register-page-routing.module';
import { EmergencyRegisterPageComponent } from './pages/emergency-register-page.component';

import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../material-module';
import { TabBarModule } from './components/tab-bar/tab-bar.module';

import { AddCaseMediaModule } from './components/Add-case-media/add-case-media/add-case-media.module';
import { AddSearchMediaDialogComponent } from './components/add-search-media-dialog/add-search-media-dialog.component';

import { SearchBoxComponent } from 'src/app/core/components/search-box/search-box.component';
import { SearchBoxModule } from 'src/app/core/components/search-box/search-box.module';

@NgModule({
    declarations: [EmergencyRegisterPageComponent, AddSearchMediaDialogComponent,SearchBoxComponent],

    imports: [
        CommonModule,
        EmergencyRegisterPageRoutingModule,
        TabBarModule,
        MaterialModule,
        FormsModule,
        AddCaseMediaModule,
        SearchBoxModule
    ],
    exports: [],
})
export class EmergencyRegisterPageModule {}
