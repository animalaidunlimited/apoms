import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { ReportingPageRoutingModule } from './reporting-page-routing.module';
import { SurgeriesByDateDialogComponent } from './components/surgeries-by-date-dialog/surgeries-by-date-dialog.component';
import { ReportingPageComponent } from './pages/reporting-page/reporting-page.component';
import { TreatmentListComponent } from './components/treatment-list/treatment-list.component';
import { TreatmentRecordComponent } from 'src/app/core/components/treatment-record/treatment-record.component';
import { EmergencyCaseDialogComponent } from './components/emergency-case-dialog/emergency-case-dialog.component';

@NgModule({
    declarations: [
        ReportingPageComponent,
        SurgeriesByDateDialogComponent,
        TreatmentListComponent,
        TreatmentRecordComponent,
        EmergencyCaseDialogComponent
    ],
    imports: [
        CommonModule,
        ReportingPageRoutingModule,
        MaterialModule
    ],
})

export class ReportingPageModule {}
