import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HospitalManagerPageComponent } from './pages/hospital-manager-page/hospital-manager-page.component';
import { HospitalManagerPageRoutingModule } from './hospital-manager-page-routing.module';

import { MaterialModule } from '../../material-module';
import { HospitalManagerTabBarComponent } from './components/hospital-manager-tab-bar/hospital-manager-tab-bar.component';
import { PatientRecordComponent } from './components/patient-record/patient-record.component';

import { RecordSearchModule } from '../../core/components/record-search/record-search.module';
import { CallerDetailsModule } from '../../core/components/caller-details/caller-details.module';
import { LocationDetailsModule } from '../../core/components/location-details/location-details.module';

import { PatientDetailsComponent } from './components/patient-details/patient-details.component';

import { CensusDetailsComponent } from './components/census-details/census-details.component';

import { SurgeryDetailsComponent } from './components/surgery-details/surgery-details.component';
import { ThankYouComponent } from './components/thank-you/thank-you.component';

@NgModule({
  declarations: [
    HospitalManagerPageComponent,
    HospitalManagerTabBarComponent,
    PatientRecordComponent,
    PatientDetailsComponent,
    CensusDetailsComponent,
    SurgeryDetailsComponent,
    ThankYouComponent,
    
    ],
  imports: [
    CommonModule,
    HospitalManagerPageRoutingModule,
    MaterialModule,
    RecordSearchModule,
    LocationDetailsModule,
    CallerDetailsModule,
  ],
  exports: [    
  ]
})
export class HospitalManagerPageModule { }
