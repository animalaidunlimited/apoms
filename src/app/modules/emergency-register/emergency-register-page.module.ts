import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmergencyRegisterPageRoutingModule } from './emergency-register-page-routing.module';
import { EmergencyRegisterPageComponent } from './pages/emergency-register-page/emergency-register-page.component';

import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../material-module';
import { TabBarModule } from './components/tab-bar/tab-bar.module';


<<<<<<< HEAD

@NgModule({
  declarations: [
    EmergencyRegisterPageComponent
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
=======
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
    exports: [],
>>>>>>> 52215419447ebc087dbdfe49fec58856bfa4d47b
})
export class EmergencyRegisterPageModule {}
