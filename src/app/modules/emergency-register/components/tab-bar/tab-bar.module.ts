import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabBarComponent } from './tab-bar.component';
import { MaterialModule } from '../../../../material-module';
import { EmergencyRecordModule } from '../emergency-record/emergency-record.module';
import { RecordSearchModule } from 'src/app/core/components/record-search/record-search.module';

@NgModule({
    declarations: [
        TabBarComponent,

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
})
export class TabBarModule {}