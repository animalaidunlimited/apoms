import { SurgeryRegisterPageComponent } from './pages/surgery-register-page/surgery-register-page.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        component: SurgeryRegisterPageComponent,
        data: { shouldReuse: true, key: 'surgery-register' },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SurgeryRegisterPageRoutingModule {}
