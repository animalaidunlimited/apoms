import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeaveRequestResolver } from '../../resolvers/leave-request-protocol.resolver';
import { UserListResolver } from '../../resolvers/user-list.resolver';
import { LeaveRequestComponent } from './leave-request.component';


const routes: Routes = [
  {
    path: '',
    component: LeaveRequestComponent,
    data: { shouldReuse: true, key: 'leave-request' },
    resolve: { userList : UserListResolver,
    leaveProtocol: LeaveRequestResolver }
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeaveRequestComponentRoutingModule { }
