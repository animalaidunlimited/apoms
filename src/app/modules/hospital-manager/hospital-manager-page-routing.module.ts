import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HospitalManagerPageComponent } from './pages/hospital-manager-page.component';

const routes: Routes = [
    {
        path: '',
        data: { shouldReuse: true, key: 'hospital-manager' },
        component: HospitalManagerPageComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class HospitalManagerPageRoutingModule {}
