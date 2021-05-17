import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehileListPageComponent } from './vehile-list-page.component';


const routes: Routes = [
  {
    path: '',
    component: VehileListPageComponent,
    data: { shouldReuse: true, key: 'vehicle-list' },
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehicleListPageRoutingModule { }
