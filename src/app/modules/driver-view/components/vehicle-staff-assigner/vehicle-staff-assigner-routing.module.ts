import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VehicleStaffAssignerComponent } from './vehicle-staff-assigner.component';

const routes: Routes = [
  {
    path: '',
    component: VehicleStaffAssignerComponent,
    data: { shouldReuse: true, key: 'vehicle-staff-assigner' },
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VehicleStaffAssignerRoutingModule { }
