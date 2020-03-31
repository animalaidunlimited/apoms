import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HospitalManagerPageComponent } from './pages/hospital-manager-page/hospital-manager-page.component';
import { HospitalManagerPageRoutingModule } from './hospital-manager-page-routing.module';

import { MaterialModule } from '../../../material-module';
import { HospitalManagerTabBarComponent } from './components/hospital-manager-tab-bar/hospital-manager-tab-bar.component';
import { PatientRecordComponent } from './components/patient-record/patient-record.component';

import { RecordSearchModule } from '../../../core/components/record-search/record-search.module';
import { CallerDetailsModule } from '../../../core/components/caller-details/caller-details.module';
import { LocationDetailsModule } from '../../../core/components/location-details/location-details.module';

import { CensusDetailsComponent } from './components/census-details/census-details.component';

import { SurgeryDetailsComponent } from './components/surgery-details/surgery-details.component';
import { ThankYouComponent } from './components/thank-you/thank-you.component';
import { CrueltyDetailsComponent } from './components/cruelty-details/cruelty-details.component';
import { OutcomeComponent } from './components/outcome/outcome.component';
import { AnimalHeaderComponent } from './components/animal-header/animal-header.component';
import { ImageUploadDialog } from 'src/app/core/components/image-upload/image-upload.component';
import { ThumbnailSliderModule } from 'src/app/core/components/thumbnail-slider/thumbnail-slider.module';
import { PatientStatusModule } from 'src/app/core/components/patient-status/patient-status.module';
import { PatientDetailsComponent } from './components/patient-details/patient-details.component';



@NgModule({
  declarations: [
    HospitalManagerPageComponent,
    HospitalManagerTabBarComponent,
    PatientRecordComponent,
    PatientDetailsComponent,
    CensusDetailsComponent,
    SurgeryDetailsComponent,
    ThankYouComponent,
    CrueltyDetailsComponent,
    OutcomeComponent,
    AnimalHeaderComponent,
    ImageUploadDialog,
    ],
    entryComponents: [ImageUploadDialog],
  imports: [
    CommonModule,
    HospitalManagerPageRoutingModule,
    MaterialModule,
    RecordSearchModule,
    LocationDetailsModule,
    CallerDetailsModule,
    ThumbnailSliderModule,
    PatientStatusModule
  ],
  exports: [
  ]
})
export class HospitalManagerPageModule { }
