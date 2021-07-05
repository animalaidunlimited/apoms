import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DriverViewComponent } from './driver-view.component';

const routes: Routes = [
  {
    path: '',
    component: DriverViewComponent,
    data: { shouldReuse: true, key: 'driver-view' },
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DriverViewRoutingModule { }
