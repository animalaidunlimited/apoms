import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveRequestComponent } from './leave-request.component';
import { LeaveRequestComponentRoutingModule } from './leave-request-routing.module';
import { MaterialModule } from 'src/app/material-module';
import { LeaveRequestFormComponent } from './../../components/leave-request-form/leave-request-form.component';
import { LeaveRequestHistoryComponent } from '../../components/leave-request-history/leave-request-history.component';
import { UserAutoCompleteModule } from '../../components/user-autocomplete/user-autocomplete.module';


@NgModule({
  imports: [
    CommonModule,
    LeaveRequestComponentRoutingModule,
    MaterialModule,
    UserAutoCompleteModule
  ],
  declarations: [
    LeaveRequestComponent,
    LeaveRequestFormComponent,
    LeaveRequestHistoryComponent
  ]
})
export class LeaveRequestModule { }
