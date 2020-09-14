import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { ReportingPageRoutingModule } from './reporting-page-routing.module';
import { ReportingPageComponent } from './pages/reporting-page/reporting-page.component';
import { ReportingRecordModule } from "./components/reporting-record/reporting-record.module";

@NgModule({
    declarations: [
        ReportingPageComponent
    ],

    imports: [
        CommonModule,
        ReportingPageRoutingModule,
        MaterialModule,
        ReportingRecordModule
    ],
    exports: [

    ]
})
export class ReportingPageModule {}
