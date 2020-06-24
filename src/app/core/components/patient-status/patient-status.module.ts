import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MaterialModule } from '../../../material-module';

import { PatientStatusComponent } from '../patient-status/patient-status.component';

@NgModule({
    declarations: [PatientStatusComponent],
    providers: [DatePipe],
    imports: [CommonModule, MaterialModule],
    exports: [PatientStatusComponent],
})
export class PatientStatusModule {}
