import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StaffRotationPageComponent } from './pages/staff-rotation/staff-rotation-page.component';
import { UserListResolver } from './resolvers/user-list.resolver';

const routes: Routes = [
  {
      path: '',
      component: StaffRotationPageComponent,
      data: { shouldReuse: true, key: 'staff-rotation' },
      resolve: { userList : UserListResolver }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffRotaRoutingModule { }
