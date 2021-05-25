import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TreatmentListPageRoutingModule } from './treatment-list-page-routing.module';
import { TreatmentListPageComponent } from './pages/treatment-list-page.component';
import { MaterialModule } from 'src/app/material-module';
import { TreatmentListComponent } from './components/treatment-list/treatment-list.component';
import { TreatmentRecordComponent } from 'src/app/core/components/treatment-record/treatment-record.component';
import { MovedRecordComponent } from './components/moved-record/moved-record.component';
import { PatientDetailsModule } from '../hospital-manager/components/patient-details/patient-details.module';



@NgModule({
  declarations: [
    TreatmentListPageComponent,
    TreatmentRecordComponent,
    TreatmentListComponent,
    MovedRecordComponent
  ],
  imports: [
    CommonModule,
    TreatmentListPageRoutingModule,
    PatientDetailsModule,
    MaterialModule
  ]
})
export class TreatmentListPageModule { }
