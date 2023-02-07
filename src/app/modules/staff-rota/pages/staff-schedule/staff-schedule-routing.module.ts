import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListResolver } from '../../resolvers/user-list.resolver';
import { StaffScheduleComponent } from './staff-schedule.component';


const routes: Routes = [
  {
    path: '',
    component: StaffScheduleComponent,
    data: { shouldReuse: true, key: 'staff-scheduletion' },
    resolve: { userList : UserListResolver }
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffScheduleComponentRoutingModule { }
