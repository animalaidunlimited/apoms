import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmergencyRegisterPatientsComponent } from './emergency-register-patients.component';
import { MaterialModule } from 'src/app/material-module';

@NgModule({
    declarations: [EmergencyRegisterPatientsComponent],
    exports: [EmergencyRegisterPatientsComponent],
    imports: [CommonModule,
        MaterialModule],
})
export class EmergencyRegisterPatientsModule {}