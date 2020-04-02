import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmergencyRegisterPageRoutingModule } from './emergency-register-page-routing.module';
import { EmergencyRegisterPageComponent } from './pages/emergency-register-page/emergency-register-page.component';

import { MaterialModule } from '../../material-module';

import { TabBarModule } from './components/tab-bar/tab-bar.module'

import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    EmergencyRegisterPageComponent,
  ],
  imports: [
    CommonModule,
    EmergencyRegisterPageRoutingModule,
    TabBarModule,
    MaterialModule,
    FormsModule,

  ],
  exports: [
  ]
})
export class EmergencyRegisterPageModule { }
