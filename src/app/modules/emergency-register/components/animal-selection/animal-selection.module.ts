import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../../../material-module';
import { AnimalSelectionComponent } from './animal-selection.component';
import { EmergencyRegisterPatientComponent } from '../emergency-register-patient/emergency-register-patient.component';

@NgModule({
    declarations: [AnimalSelectionComponent,EmergencyRegisterPatientComponent],
    imports: [
        CommonModule,
        MaterialModule
    ],
    exports:[AnimalSelectionComponent,EmergencyRegisterPatientComponent]
})
export class AnimalSelectionModule {}
