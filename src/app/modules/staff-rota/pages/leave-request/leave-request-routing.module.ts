import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeaveRequestComponent } from './leave-request.component';


const routes: Routes = [
  {
    path: '',
    component: LeaveRequestComponent,
    data: { shouldReuse: true, key: 'leave-request' },
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LeaveRequestComponentRoutingModule { }
