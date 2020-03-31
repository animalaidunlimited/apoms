import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../../material-module';

import { RecordSearchComponent } from '../record-search/record-search.component'
import { QuickEditDialog } from '../quick-edit/quick-edit.component';
import { PatientStatusComponent } from '../patient-status/patient-status.component';
import { PatientStatusModule } from '../patient-status/patient-status.module';


@NgModule({
    declarations: [
        RecordSearchComponent,
        QuickEditDialog


    ],
    imports: [
        CommonModule,
        MaterialModule,
        PatientStatusModule
    ],
    exports: [
        RecordSearchComponent
    ],
    entryComponents: [
        QuickEditDialog,
        PatientStatusComponent
      ],
})
export class RecordSearchModule {}