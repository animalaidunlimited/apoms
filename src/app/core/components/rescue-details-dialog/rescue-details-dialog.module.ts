import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../../material-module';
import { RescueDetailsDialogComponent } from './rescue-details-dialog.component';
import { AnimalSelectionModule } from 'src/app/modules/emergency-register/components/animal-selection/animal-selection.module';
import { RescueDetailsModule } from '../rescue-details/rescue-details.module';

@NgModule({
    declarations: [RescueDetailsDialogComponent],
    imports: [
        CommonModule,
        MaterialModule,
        AnimalSelectionModule,
        RescueDetailsModule
    ],
    exports: [RescueDetailsDialogComponent],
})
export class RescueDetailsMatDialogModule {}
