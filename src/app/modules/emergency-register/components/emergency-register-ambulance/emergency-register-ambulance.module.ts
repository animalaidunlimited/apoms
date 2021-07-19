import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmergencyRegisterAmbulanceComponent } from './emergency-register-ambulance.component';
import { MaterialModule } from './../../../../material-module';
@NgModule({
  declarations: [EmergencyRegisterAmbulanceComponent],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports:[EmergencyRegisterAmbulanceComponent]
})
export class EmergencyRegisterAmbulanceModule { }
