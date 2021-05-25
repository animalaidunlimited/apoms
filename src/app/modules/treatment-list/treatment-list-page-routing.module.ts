import { TreatmentListPageComponent } from './pages/treatment-list-page.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    data: { shouldReuse: true, key: 'treatment-list' },
    component: TreatmentListPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TreatmentListPageRoutingModule { }
