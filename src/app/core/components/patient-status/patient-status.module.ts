import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material-module';

import { PatientStatusComponent } from '../patient-status/patient-status.component';

@NgModule({
    declarations: [PatientStatusComponent],
    providers: [],
    imports: [CommonModule, MaterialModule],
    exports: [PatientStatusComponent],
})
export class PatientStatusModule {}
