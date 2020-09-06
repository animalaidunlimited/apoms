import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { ReportingPageRoutingModule } from './reporting-page-routing.module';
import { ReportingPageComponent } from './reporting-page.component';

@NgModule({
    declarations: [ReportingPageComponent],
    imports: [CommonModule, ReportingPageRoutingModule,MaterialModule],
})
export class ReportingPageModule {}
