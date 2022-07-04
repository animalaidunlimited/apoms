import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StaffRotaPageComponent } from './pages/staff-rota-page.component';

const routes: Routes = [
  {
      path: '',
      component: StaffRotaPageComponent,
      data: { shouldReuse: true, key: 'staff-rotar' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StaffRotaRoutingModule { }
