import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabBarComponent } from './tab-bar.component';
import { EmergencyRecordModule } from '../emergency-record/emergency-record.module';
import { RecordSearchModule } from 'src/app/core/components/record-search/record-search.module';
import { RescueDetailsModule } from 'src/app/core/components/rescue-details/rescue-details.module';
import { MaterialModule } from 'src/app/material-module';
import { EmergencyDetailsModule } from 'src/app/core/components/emergency-details/emergency-details.module';
import { EmergencyCaseOutcomeModule } from '../emergency-case-outcome/emergency-case-outcome.module';

import { ReleaseAssignDialogComponent } from 'src/app/core/components/release-assign-dialog/release-assign-dialog.component';
import { ReleaseAssignModule } from 'src/app/core/components/release-assign/release-assign.module';
import { OutstandingCaseBoardModule } from '../outstanding-case-board/outstanding-case-board.module';
import { GalleryWrapperModule } from 'src/app/core/components/media/media-gallery-wrapper/media-gallery-wrapper.module';


@NgModule({
    declarations: [
        TabBarComponent,
        ReleaseAssignDialogComponent
    ],
    imports: [
        CommonModule,
        EmergencyRecordModule,
        RecordSearchModule,
        RescueDetailsModule,
        EmergencyDetailsModule,
        MaterialModule,
        EmergencyCaseOutcomeModule,
        ReleaseAssignModule,
        OutstandingCaseBoardModule,
        GalleryWrapperModule
    ],
    exports: [TabBarComponent]
})
export class TabBarModule {}
