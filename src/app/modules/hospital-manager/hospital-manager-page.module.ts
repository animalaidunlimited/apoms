import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HospitalManagerPageComponent } from './pages/hospital-manager-page.component';
import { HospitalManagerPageRoutingModule } from './hospital-manager-page-routing.module';

import { MaterialModule } from '../../material-module';
import { HospitalManagerTabBarComponent } from './components/hospital-manager-tab-bar/hospital-manager-tab-bar.component';
import { PatientRecordComponent } from './components/patient-record/patient-record.component';

import { RecordSearchModule } from '../../core/components/record-search/record-search.module';
import { CallerDetailsModule } from '../../core/components/caller-details/caller-details.module';
import { LocationDetailsModule } from '../../core/components/location-details/location-details.module';

import { CensusDetailsComponent } from './components/census-details/census-details.component';
import { CensusRecordModule } from 'src/app/modules/census/components/census-record/census-record.module';
import { SurgeryDetailsComponent } from './components/surgery-details/surgery-details.component';
import { PatientCallComponent } from './components/patient-call/patient-call.component';
import { CrueltyDetailsComponent } from './components/cruelty-details/cruelty-details.component';
import { OutcomeComponent } from './components/outcome/outcome.component';
import { AnimalHeaderComponent } from './components/animal-header/animal-header.component';
import { ImageUploadDialog } from 'src/app/core/components/image-upload/image-upload.component';
import { ThumbnailSliderModule } from 'src/app/core/components/thumbnail-slider/thumbnail-slider.module';
import { PatientStatusModule } from 'src/app/core/components/patient-status/patient-status.module';
import { PatientDetailsComponent } from './components/patient-details/patient-details.component';
import { RescueDetailsModule } from 'src/app/core/components/rescue-details/rescue-details.module';
import { EmergencyDetailsModule } from 'src/app/core/components/emergency-details/emergency-details.module';
import { PatientCallDialogComponent } from './components/patient-call-dialog/patient-call-dialog.component';
import { AddSurgeryDialogComponent } from './components/add-surgery-dialog/add-surgery-dialog.component';
import { SurgeryRecordModule } from '../surgery-register/components/surgery-record.module';
import { SurgeryRecordDialogComponent } from './components/surgery-record-dialog/surgery-record-dialog.component';
import { UpdateCensusDialogComponent } from './components/update-census-dialog/update-census-dialog.component';
import { MediaCaptureComponent } from 'src/app/core/components/media-capture/media-capture.component';
import { NgxGalleryModule } from '@animalaidunlimited/ngx-gallery-aau';


@NgModule({
    declarations: [
        HospitalManagerPageComponent,
        HospitalManagerTabBarComponent,
        PatientRecordComponent,
        PatientDetailsComponent,
        CensusDetailsComponent,
        SurgeryDetailsComponent,
        PatientCallComponent,
        PatientCallDialogComponent,
        CrueltyDetailsComponent,
        OutcomeComponent,
        AnimalHeaderComponent,
        ImageUploadDialog,
        SurgeryRecordDialogComponent,
        AddSurgeryDialogComponent,
        UpdateCensusDialogComponent,
        MediaCaptureComponent
    ],
    imports: [
        CommonModule,
        HospitalManagerPageRoutingModule,
        MaterialModule,
        RecordSearchModule,
        LocationDetailsModule,
        CallerDetailsModule,
        ThumbnailSliderModule,
        PatientStatusModule,
        RescueDetailsModule,
        EmergencyDetailsModule,
        SurgeryRecordModule,
        CensusRecordModule,
        NgxGalleryModule
    ],
    exports: [],
})
export class HospitalManagerPageModule {}
