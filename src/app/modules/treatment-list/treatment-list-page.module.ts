import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TreatmentListPageRoutingModule } from './treatment-list-page-routing.module';
import { TreatmentListPageComponent } from './pages/treatment-list-page.component';
import { MaterialModule } from 'src/app/material-module';
import { TreatmentListComponent } from './components/treatment-list/treatment-list.component';
import { TreatmentRecordComponent } from 'src/app/core/components/treatment-record/treatment-record.component';



@NgModule({
  declarations: [
    TreatmentListPageComponent,
    TreatmentRecordComponent,
    TreatmentListComponent
  ],
  imports: [
    CommonModule,
    TreatmentListPageRoutingModule,
    MaterialModule
  ]
})
export class TreatmentListPageModule { }
