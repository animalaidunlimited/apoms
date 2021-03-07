import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogsComponent } from './logs.component';
import { MaterialModule } from 'src/app/material-module';


@NgModule({
  declarations: [
    LogsComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports:[
    LogsComponent
  ]
})
export class LogsModule { }
