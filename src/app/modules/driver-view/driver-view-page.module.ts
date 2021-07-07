import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriverViewPageRoutingModule } from './driver-view-page-routing.module';
import { VehileListPageComponent } from './pages/vehile-list-page/vehile-list-page.component';
import { MaterialModule } from 'src/app/material-module';
import { MatFormFieldModule } from '@angular/material/form-field';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { DriverViewAssignmentComponent } from './components/driver-view-assignment/driver-view-assignment.component';
import { DriverViewIconsComponent } from './components/driver-view-icons/driver-view-icons.component';
import { CallerDetailsDialogComponent } from './dialogs/caller-details-dialog/caller-details-dialog.component';
import { CallerDetailsModule } from 'src/app/core/components/caller-details/caller-details.module';
import { CallerDetailsComponent } from 'src/app/core/components/caller-details/caller-details.component';
@NgModule({
  declarations: [VehileListPageComponent, DriverViewAssignmentComponent, DriverViewIconsComponent, CallerDetailsDialogComponent],
  imports: [
    CommonModule,
    DriverViewPageRoutingModule,
    MaterialModule,
    DragDropModule,
    CallerDetailsModule
  ]
})
export class DriverViewPageModule { }
