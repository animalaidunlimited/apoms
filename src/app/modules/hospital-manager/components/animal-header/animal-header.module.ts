import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimalHeaderComponent } from './animal-header.component';
import { MaterialModule } from 'src/app/material-module';


@NgModule({
  declarations: [
    AnimalHeaderComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports:[
    AnimalHeaderComponent
  ]
})
export class AnimalHeaderModule { }