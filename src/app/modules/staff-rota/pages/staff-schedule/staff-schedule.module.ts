import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaffScheduleComponent } from './staff-schedule.component';
import { MaterialModule } from 'src/app/material-module';
import { StaffScheduleComponentRoutingModule } from './staff-schedule-routing.module';
import { StaffScheduleDayComponent } from './components/staff-schedule-day/staff-schedule-day.component';
import { UserAutoCompleteModule } from '../../components/user-autocomplete/user-autocomplete.module';
import { AreaStaffCoverageComponent } from '../../components/area-staff-coverage/area-staff-coverage.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { StaffScheduleWeekComponent } from './components/staff-schedule-week/staff-schedule-week.component';

@NgModule({
  imports: [
  CommonModule,
    StaffScheduleComponentRoutingModule,
    MaterialModule,
    UserAutoCompleteModule,
    NgxChartsModule
  ],
  declarations: [
    StaffScheduleComponent,
    StaffScheduleDayComponent,
    StaffScheduleWeekComponent,
    AreaStaffCoverageComponent
  ]
})
export class StaffScheduleModule { }
