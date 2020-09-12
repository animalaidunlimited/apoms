import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { ReportingPageRoutingModule } from './reporting-page-routing.module';
import { ReportingPageComponent } from './reporting-page.component';
import { ReportingRecordModule } from "src/app/modules/reporting/components/reporting-record/reporting-record.module";


@NgModule({
    declarations: [ReportingPageComponent],

    imports: [CommonModule, 
        ReportingPageRoutingModule,
        ReportingRecordModule,
        MaterialModule
    ],
    exports:[ReportingPageComponent]
})
export class ReportingPageModule {}
