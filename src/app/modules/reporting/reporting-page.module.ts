import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { ReportingPageRoutingModule } from './reporting-page-routing.module';
import { SurgeriesByDateDialogComponent } from './components/surgeries-by-date-dialog/surgeries-by-date-dialog.component';
import { ReportingPageComponent } from './pages/reporting-page/reporting-page.component';
import { PatientDetailsDialogComponent } from './components/patient-details-dialog/patient-details-dialog.component';

@NgModule({
    declarations: [
        ReportingPageComponent,
        SurgeriesByDateDialogComponent,
        PatientDetailsDialogComponent
    ],
    imports: [
        CommonModule,
        ReportingPageRoutingModule,
        MaterialModule
    ],
})

export class ReportingPageModule {}
