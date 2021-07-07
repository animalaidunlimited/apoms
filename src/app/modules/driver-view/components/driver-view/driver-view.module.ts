import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DriverViewRoutingModule } from './driver-view-routing.module';
import { DriverViewComponent } from './driver-view.component';
import { MaterialModule } from 'src/app/material-module';
import { DriverViewAssignmentComponent } from '../driver-view-assignment/driver-view-assignment.component';
import { DriverViewIconsComponent } from '../driver-view-icons/driver-view-icons.component';
import { CallerDetailsDialogComponent } from '../../dialogs/caller-details-dialog/caller-details-dialog.component';
import { CallerDetailsModule } from 'src/app/core/components/caller-details/caller-details.module';


@NgModule({
  declarations: [DriverViewComponent, DriverViewAssignmentComponent, DriverViewIconsComponent,CallerDetailsDialogComponent],
  imports: [
    CommonModule,
    DriverViewRoutingModule,
    MaterialModule
  ]
})
export class DriverViewModule { }
