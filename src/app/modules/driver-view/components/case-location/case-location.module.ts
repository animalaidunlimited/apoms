import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CaseLocationRoutingModule } from './case-location-routing.module';
import { CaseLocationComponent } from './case-location.component';
import { MaterialModule } from 'src/app/material-module';
import { GoogleMapsModule } from '@angular/google-maps';


@NgModule({
  declarations: [CaseLocationComponent],
  imports: [
    CommonModule,
    CaseLocationRoutingModule,
    MaterialModule,
    GoogleMapsModule
  ]
})
export class CaseLocationModule { }
