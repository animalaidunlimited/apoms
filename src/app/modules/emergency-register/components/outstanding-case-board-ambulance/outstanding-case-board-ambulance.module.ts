import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './../../../../material-module';
import { OutstandingCaseBoardAmbulanceComponent } from './outstanding-case-board-ambulance.component';
import { SharedPipesModule } from 'src/app/shared-pipes.module';
import { OutstandingCaseBoardCasePanelModule } from '../outstanding-case-board-case-panel/oustadning-case-baord-case-panel.module';
@NgModule({
  declarations: [
    OutstandingCaseBoardAmbulanceComponent],
  imports: [
    CommonModule,
    MaterialModule,
    SharedPipesModule,
    OutstandingCaseBoardCasePanelModule
  ],
  exports:[OutstandingCaseBoardAmbulanceComponent]
})
export class OutstandingCaseBoardAmbulanceModule { }
