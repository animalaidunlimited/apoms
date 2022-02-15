import { EmergencyRecordCommentDialogComponent } from './emergency-record-comment-dialog/emergency-record-comment-dialog.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../../../material-module';

import { EmergencyRecordComponent } from './emergency-record.component';
import { TagNumberDialog } from '../tag-number-dialog/tag-number-dialog.component';
import { CallerDetailsModule } from 'src/app/core/components/caller-details/caller-details.module';
import { LocationDetailsModule } from 'src/app/core/components/location-details/location-details.module';
import { RescueDetailsModule } from 'src/app/core/components/rescue-details/rescue-details.module';
import { EmergencyDetailsModule } from 'src/app/core/components/emergency-details/emergency-details.module';
import { EmergencyCaseOutcomeModule } from '../emergency-case-outcome/emergency-case-outcome.module';
import { PatientVisitDetailsModule} from 'src/app/core/components/patient-visit-details/patient-visit-details.module';
import { AnimalSelectionModule } from '../animal-selection/animal-selection.module';
import { MediaDialogModule } from 'src/app/core/components/media/media-dialog/media-dialog.module';

@NgModule({
    declarations: [
        EmergencyRecordComponent,
        TagNumberDialog,
        EmergencyRecordCommentDialogComponent
    ],
    providers: [
    ],
    imports: [
        CommonModule,
        MaterialModule,
        CallerDetailsModule,
        LocationDetailsModule,
        RescueDetailsModule,
        EmergencyDetailsModule,
        EmergencyCaseOutcomeModule,
        PatientVisitDetailsModule,
        AnimalSelectionModule,
        MediaDialogModule
    ],
    exports: [EmergencyRecordComponent,AnimalSelectionModule],
})
export class EmergencyRecordModule {}