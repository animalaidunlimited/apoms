import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DriverViewRoutingModule } from './driver-view-routing.module';
import { DriverViewComponent } from './driver-view.component';
import { MaterialModule } from 'src/app/material-module';
import { DriverViewAssignmentComponent } from '../driver-view-assignment/driver-view-assignment.component';
import { DriverViewIconsComponent } from '../driver-view-icons/driver-view-icons.component';
import { CallerDetailsDialogComponent } from '../../dialogs/caller-details-dialog/caller-details-dialog.component';
import { CallerDetailsModule } from 'src/app/core/components/caller-details/caller-details.module';
import { GoogleMapsModule } from '@angular/google-maps';
import { LocationDialogComponent } from '../../dialogs/location-dialog/location-dialog.component';
import { DriverActionDialogComponent } from '../../dialogs/driver-action-dialog/driver-action-dialog.component';


@NgModule({
  declarations: [DriverViewComponent, 
    DriverViewAssignmentComponent, 
    DriverViewIconsComponent,
    CallerDetailsDialogComponent,
    LocationDialogComponent,
    DriverActionDialogComponent
  ],
  imports: [
    CommonModule,
    DriverViewRoutingModule,
    MaterialModule,
    CallerDetailsModule,
    GoogleMapsModule
  ]
})
export class DriverViewModule { }
