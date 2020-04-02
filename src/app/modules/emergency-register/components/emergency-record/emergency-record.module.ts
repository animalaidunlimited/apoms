import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { MaterialModule } from '../../../../material-module';

import { EmergencyRecordComponent } from './emergency-record.component'
import { AnimalSelectionComponent } from '../animal-selection/animal-selection.component';
import { TagNumberDialog } from '../tag-number-dialog/tag-number-dialog.component';
import { RescueDetailsComponent } from '../rescue-details/rescue-details.component';
import { CallerDetailsModule } from 'src/app/core/components/caller-details/caller-details.module';
import { LocationDetailsModule } from 'src/app/core/components/location-details/location-details.module';

@NgModule({
    declarations: [
        EmergencyRecordComponent,
        AnimalSelectionComponent,
        TagNumberDialog,
        RescueDetailsComponent,
    ],
    providers: [
        DatePipe
    ],
    imports: [
        CommonModule,
        MaterialModule,
        CallerDetailsModule,
        LocationDetailsModule,
    ],
    exports: [
        EmergencyRecordComponent
    ],
})
export class EmergencyRecordModule {}