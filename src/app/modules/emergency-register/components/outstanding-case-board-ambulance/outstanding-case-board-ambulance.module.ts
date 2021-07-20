import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './../../../../material-module';
import { OutstandingCaseBoardAmbulanceComponent } from './outstanding-case-board-ambulance.component';
import { SharedPipesModule } from 'src/app/shared-pipes.module';
@NgModule({
  declarations: [OutstandingCaseBoardAmbulanceComponent],
  imports: [

  CommonModule,
    MaterialModule,
    SharedPipesModule
  ],
  exports:[OutstandingCaseBoardAmbulanceComponent]
})
export class OutstandingCaseBoardAmbulanceModule { }
