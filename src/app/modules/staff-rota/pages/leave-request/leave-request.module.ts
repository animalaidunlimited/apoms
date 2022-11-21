import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveRequestComponent } from './leave-request.component';
import { LeaveRequestComponentRoutingModule } from './leave-request-routing.module';
import { MaterialModule } from 'src/app/material-module';
import { LeaveRequestFormComponent } from './../../components/leave-request-form/leave-request-form.component';

@NgModule({
  imports: [
CommonModule,
    LeaveRequestComponentRoutingModule,
    MaterialModule
  ],
  declarations: [
    LeaveRequestComponent,
    LeaveRequestFormComponent
  ]
})
export class LeaveRequestModule { }
