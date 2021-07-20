import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './../../../../material-module';
import { OutstandingCaseBoardAmbulanceComponent } from './outstanding-case-board-ambulance.component';
@NgModule({
  declarations: [OutstandingCaseBoardAmbulanceComponent],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports:[OutstandingCaseBoardAmbulanceComponent]
})
export class OutstandingCaseBoardAmbulanceModule { }
