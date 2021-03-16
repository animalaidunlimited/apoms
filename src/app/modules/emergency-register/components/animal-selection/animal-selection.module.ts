import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../../../material-module';
import { AnimalSelectionComponent } from './animal-selection.component';
import { EmergencyRegisterPatientsModule } from 'src/app/modules/emergency-register/components/emergency-register-patients/emergency-register-patients.module';

@NgModule({
    declarations: [AnimalSelectionComponent],
    imports: [
        CommonModule,
        MaterialModule,
        EmergencyRegisterPatientsModule
    ],
    exports: [AnimalSelectionComponent]
})
export class AnimalSelectionModule {}
