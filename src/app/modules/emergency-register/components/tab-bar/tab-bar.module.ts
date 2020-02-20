import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabBarComponent } from './tab-bar.component';
import { MaterialModule } from '../../../../material-module';
//import { EmergencyRecordComponent } from '../emergency-record/emergency-record.component';
import { EmergencyRecordModule } from '../emergency-record/emergency-record.module';
import { RecordSearchModule } from 'src/app/core/components/record-search/record-search.module';



@NgModule({
    declarations: [
        TabBarComponent,
       // EmergencyRecordComponent

    ],
    imports: [
        CommonModule,
        EmergencyRecordModule,
        MaterialModule,
        RecordSearchModule

    ],
    exports: [
        TabBarComponent
    ],
    entryComponents: [
      ],
})
export class TabBarModule {}