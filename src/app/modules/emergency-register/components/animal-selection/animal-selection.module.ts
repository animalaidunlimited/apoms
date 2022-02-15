import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../../../material-module';
import { AnimalSelectionComponent } from './animal-selection.component';
import { EmergencyRegisterPatientComponent } from '../emergency-register-patient/emergency-register-patient.component';
import { EmergencyCaseOutcomeModule } from '../emergency-case-outcome/emergency-case-outcome.module';
import { RescueDetailsModule } from 'src/app/core/components/rescue-details/rescue-details.module';
import { GalleryWrapperModule } from 'src/app/core/components/media/media-gallery-wrapper/media-gallery-wrapper.module';

@NgModule({
    declarations: [AnimalSelectionComponent,EmergencyRegisterPatientComponent],
    imports: [
        CommonModule,
        MaterialModule,
        EmergencyCaseOutcomeModule,
        RescueDetailsModule,
        GalleryWrapperModule
    ],
    exports:[AnimalSelectionComponent,EmergencyRegisterPatientComponent]
})
export class AnimalSelectionModule {}
