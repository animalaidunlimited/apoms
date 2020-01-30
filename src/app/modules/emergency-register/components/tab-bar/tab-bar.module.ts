import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabBarComponent } from './tab-bar.component';

import { EmergencyRecordComponent } from '../emergency-record/emergency-record.component'

@NgModule({
    declarations: [
        TabBarComponent,
        EmergencyRecordComponent,
     
    ],
    imports: [
        CommonModule,

    ],
    entryComponents: [
      ],
})
export class TabBarModule {}