import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientVisitDetailsComponent } from './patient-visit-details.component';
import { MaterialModule } from 'src/app/material-module';


@NgModule({
  declarations: [
    PatientVisitDetailsComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports:[
    PatientVisitDetailsComponent
  ]
})
export class PatientVisitDetailsModule { }
