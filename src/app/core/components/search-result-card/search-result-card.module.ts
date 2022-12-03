import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../../material-module';

import { SearchResultCardComponent } from '../search-result-card/search-result-card.component';
import { PatientEditDialog } from '../patient-edit/patient-edit.component';
import { PatientStatusModule } from '../patient-status/patient-status.module';
import { RescueDetailsMatDialogModule } from '../rescue-details-dialog/rescue-details-dialog.module';
import { GalleryWrapperModule } from '../media/media-gallery-wrapper/media-gallery-wrapper.module';

@NgModule({
    declarations: [
        SearchResultCardComponent,
        PatientEditDialog
    ],
    imports: [
        CommonModule,
        MaterialModule,
        PatientStatusModule,
        RescueDetailsMatDialogModule,
        GalleryWrapperModule
        ],
    exports: [SearchResultCardComponent]
})
export class SearchResultCardModule {}
