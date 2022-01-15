import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { VehicleListPageModule } from './pages/vehicle-list-page/vehicle-list-page.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MaterialModule,
    DragDropModule,
    VehicleListPageModule

  ]
})
export class DriverViewPageModule { }
