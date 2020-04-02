import { TeamSchedulePageComponent } from './team-schedule-page.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [ {path:'',component:TeamSchedulePageComponent,data:{shouldReuse:true,key:'team-schedule'}},  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeamSchedulePageRoutingModule { }
