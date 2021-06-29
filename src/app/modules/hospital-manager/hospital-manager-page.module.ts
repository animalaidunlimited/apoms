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

import { SurgeryDetailsComponent } from './components/surgery-details/surgery-details.component';
import { PatientCallComponent } from './components/patient-call/patient-call.component';
import { CrueltyDetailsComponent } from './components/cruelty-details/cruelty-details.component';
import { OutcomeComponent } from './components/outcome/outcome.component';

import { ImageUploadDialog } from 'src/app/core/components/image-upload/image-upload.component';
import { ThumbnailSliderModule } from 'src/app/core/components/thumbnail-slider/thumbnail-slider.module';
import { PatientStatusModule } from 'src/app/core/components/patient-status/patient-status.module';
import { RescueDetailsModule } from 'src/app/core/components/rescue-details/rescue-details.module';
import { EmergencyDetailsModule } from 'src/app/core/components/emergency-details/emergency-details.module';
import { PatientCallDialogComponent } from './components/patient-call-dialog/patient-call-dialog.component';
import { AddSurgeryDialogComponent } from './components/add-surgery-dialog/add-surgery-dialog.component';
import { SurgeryRecordModule } from '../surgery-register/components/surgery-record.module';
import { SurgeryRecordDialogComponent } from './components/surgery-record-dialog/surgery-record-dialog.component';
import { MediaCaptureComponent } from 'src/app/core/components/media/media-capture/media-capture.component';
import { TreatmentComponent } from './components/treatment/treatment.component';
import { PatientVisitDetailsModule} from '../../core/components/patient-visit-details/patient-visit-details.module';
import { ReleaseDetailsDialogComponent } from './components/release-details-dialog/release-details-dialog.component';
import { AnimalHeaderModule } from './components/animal-header/animal-header.module';
import { LogsModule } from 'src/app/core/components/logs/logs.module';
import { TreatmentAreaHistoryComponent } from './components/treatment-area-history/treatment-area-history.component';
import { PatientDetailsModule } from './components/patient-details/patient-details.module';
import { ReleaseAssignModule } from 'src/app/core/components/release-assign/release-assign.module';
import { ReleaseDetailsComponent } from './components/release-details/release-details.component';



@NgModule({
    declarations: [
        HospitalManagerPageComponent,
        HospitalManagerTabBarComponent,
        PatientRecordComponent,
        SurgeryDetailsComponent,
        PatientCallComponent,
        PatientCallDialogComponent,
        CrueltyDetailsComponent,
        OutcomeComponent,
        ImageUploadDialog,
        SurgeryRecordDialogComponent,
        AddSurgeryDialogComponent,
        MediaCaptureComponent,
        TreatmentComponent,
        TreatmentAreaHistoryComponent,
        ReleaseDetailsDialogComponent,
        ReleaseDetailsComponent,
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
        PatientDetailsModule,
        EmergencyDetailsModule,
        SurgeryRecordModule,
        CallerDetailsModule,
        ReleaseAssignModule,
        PatientVisitDetailsModule,
        AnimalHeaderModule,
        LogsModule
    ],
    exports: [],
})
export class HospitalManagerPageModule {}
