import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './../../../../material-module';
import { SharedPipesModule } from 'src/app/shared-pipes.module';
import { OutstandingCaseBoardCasePanelComponent } from './outstanding-case-board-case-panel.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
@NgModule({
  declarations: [
    OutstandingCaseBoardCasePanelComponent
],
  imports: [
    CommonModule,
    MaterialModule,
    BrowserAnimationsModule,
    SharedPipesModule
  ],
  exports:[OutstandingCaseBoardCasePanelComponent]
})
export class OutstandingCaseBoardCasePanelModule { }