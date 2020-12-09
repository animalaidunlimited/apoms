import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabBarComponent } from './tab-bar.component';
import { EmergencyRecordModule } from '../emergency-record/emergency-record.module';
import { RecordSearchModule } from 'src/app/core/components/record-search/record-search.module';
import { RescueDetailsModule } from 'src/app/core/components/rescue-details/rescue-details.module';
import { MaterialModule } from 'src/app/material-module';
import { EmergencyDetailsModule } from 'src/app/core/components/emergency-details/emergency-details.module';
import { RescueDetailsDialogComponent } from 'src/app/core/components/rescue-details-dialog/rescue-details-dialog.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EmergencyCaseOutcomeModule } from '../emergency-case-outcome/emergency-case-outcome.module';
import { OutstandingCaseBoardModule } from '../outstanding-case-board/outstanding-case-board.module';
import { AssignReleaseDialogComponent } from 'src/app/core/components/assign-release-dialog/assign-release-dialog.component';
import { AssignReleaseComponent } from 'src/app/core/components/assign-release/assign-release.component';

@NgModule({
    declarations: [
        TabBarComponent,
        RescueDetailsDialogComponent,
        AssignReleaseDialogComponent,
        AssignReleaseComponent
    ],
    imports: [
        CommonModule,
        EmergencyRecordModule,
        RecordSearchModule,
        RescueDetailsModule,
        EmergencyDetailsModule,
        MaterialModule,
        FlexLayoutModule,
        EmergencyCaseOutcomeModule,
        OutstandingCaseBoardModule
    ],
    exports: [TabBarComponent],
})
export class TabBarModule {}
