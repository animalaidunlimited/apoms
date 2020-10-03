import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { ReportingPageRoutingModule } from 'src/app/modules/reporting/reporting-page-routing.module';
import { ReportingRecordComponent } from './reporting-record.component';
import { PatientDetailsDialogComponent } from '../patient-details-dialog/patient-details-dialog.component';

@NgModule({
    declarations: [
        ReportingRecordComponent,
        PatientDetailsDialogComponent
    ],
    imports: [
        CommonModule,
        ReportingPageRoutingModule,
        MaterialModule
    ],
    exports : [
        ReportingRecordComponent
    ]
})
export class ReportingRecordModule {}
