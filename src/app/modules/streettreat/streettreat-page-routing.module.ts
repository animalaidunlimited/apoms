import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StreetTreatPageComponent } from './pages/streettreat-page.component';

const routes: Routes = [
  {
    path: '',
    data: { shouldReuse: true, key: 'street-treat' },
    component: StreetTreatPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StreetTreatPageRoutingModule { }
