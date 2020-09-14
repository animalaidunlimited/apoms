import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { ReportingPageRoutingModule } from './reporting-page-routing.module';
import { ReportingPageComponent } from './pages/reporting-page/reporting-page.component';
import { ReportingRecordModule } from "./components/reporting-record/reporting-record.module";
import { PatientDetailsDialogComponent } from './components/patient-details-dialog/patient-details-dialog.component';
import { MatTableModule } from "@angular/material/table";
import { CdkTableModule } from '@angular/cdk/table';

@NgModule({
    declarations: [ReportingPageComponent, PatientDetailsDialogComponent],

    imports: [CommonModule, 
        ReportingPageRoutingModule,
        MaterialModule,
        ReportingRecordModule,
        MatTableModule,
        CdkTableModule
    ],
})
export class ReportingPageModule {}
