import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HospitalManagerPageComponent } from './pages/hospital-manager-page.component';

const routes: Routes = [
    {
        path: '',
        component: HospitalManagerPageComponent,
        data: { shouldReuse: true, key: 'hospital-manager' }
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class HospitalManagerPageRoutingModule {}
