import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SurgeryRegisterPageRoutingModule } from './surgery-register-page-routing.module';
import { SurgeryRegisterPageComponent } from './surgery-register-page.component';

@NgModule({
  declarations: [SurgeryRegisterPageComponent],
  imports: [
    CommonModule,
    SurgeryRegisterPageRoutingModule
  ]
})
export class SurgeryRegisterPageModule { }
