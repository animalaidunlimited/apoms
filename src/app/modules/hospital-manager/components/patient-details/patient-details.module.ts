import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { PatientDetailsComponent } from './patient-details.component';


@NgModule({
  declarations: [
    PatientDetailsComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports:[
    PatientDetailsComponent
  ]
})
export class PatientDetailsModule { }