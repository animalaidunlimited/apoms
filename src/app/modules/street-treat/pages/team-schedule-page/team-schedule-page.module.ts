import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeamSchedulePageRoutingModule } from './team-schedule-page-routing.module';
import { TeamSchedulePageComponent } from './team-schedule-page.component';

@NgModule({
    declarations: [TeamSchedulePageComponent],
    imports: [CommonModule, TeamSchedulePageRoutingModule],
})
export class TeamSchedulePageModule {}
