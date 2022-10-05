import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StaffRotationPageComponent } from './pages/staff-rotation/staff-rotation-page.component';

const routes: Routes = [
  {
      path: '',
      component: StaffRotationPageComponent,
      data: { shouldReuse: true, key: 'staff-rotation' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffRotaRoutingModule { }
