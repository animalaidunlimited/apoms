import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { MaterialModule } from '../../../../material-module';

import { EmergencyRecordComponent } from './emergency-record.component'
import { AnimalSelectionComponent } from '../animal-selection/animal-selection.component';
import { TagNumberDialog } from '../tag-number-dialog/tag-number-dialog.component';
import { CallerDetailsModule } from 'src/app/core/components/caller-details/caller-details.module';
import { LocationDetailsModule } from 'src/app/core/components/location-details/location-details.module';
import { RescueDetailsModule } from 'src/app/core/components/rescue-details/rescue-details.module';
import { EmergencyDetailsModule } from 'src/app/core/components/emergency-details/emergency-details.module';
import { EmergencyCaseOutcomeModule } from '../emergency-case-outcome/emergency-case-outcome.module';

@NgModule({
    declarations: [
        EmergencyRecordComponent,
        AnimalSelectionComponent,
        TagNumberDialog,
    ],
    providers: [
        DatePipe
    ],
    imports: [
        CommonModule,
        MaterialModule,
        CallerDetailsModule,
        LocationDetailsModule,
        RescueDetailsModule,
        EmergencyDetailsModule,
        EmergencyCaseOutcomeModule

    ],
    exports: [
        EmergencyRecordComponent
    ],
})
export class EmergencyRecordModule {}