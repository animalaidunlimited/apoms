import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriverViewPageRoutingModule } from './driver-view-page-routing.module';
import { MaterialModule } from 'src/app/material-module';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { VehicleListPageModule } from './pages/vehicle-list-page/vehicle-list-page.module';
import { DriverViewIconsComponent } from './components/driver-view-icons/driver-view-icons.component';
import { CallerDetailsDialogComponent } from './dialogs/caller-details-dialog/caller-details-dialog.component';
import { DriverActionDialogComponent } from './dialogs/driver-action-dialog/driver-action-dialog.component';
import { DriverViewModule } from './components/driver-view/driver-view.module';

@NgModule({
  declarations: [
    DriverViewIconsComponent,
    CallerDetailsDialogComponent,
    DriverActionDialogComponent
  ],
  imports: [
    CommonModule,
    DriverViewPageRoutingModule,
    MaterialModule,
    DragDropModule,
    VehicleListPageModule,
    DriverViewModule
  ]
})
export class DriverViewPageModule { }
