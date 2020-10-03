import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { ReportingPageRoutingModule } from './reporting-page-routing.module';
import { ReportingPageComponent } from './components/reporting-page.component';
import { SurgeriesByDateDialogComponent } from './components/surgeries-by-date-dialog/surgeries-by-date-dialog.component';

@NgModule({
    declarations: [
        ReportingPageComponent,
        SurgeriesByDateDialogComponent
    ],
    imports: [
        CommonModule,
        ReportingPageRoutingModule,
        MaterialModule],
})
export class ReportingPageModule {}
