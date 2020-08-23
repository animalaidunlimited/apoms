import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmergencyRegisterPageComponent } from './pages/emergency-register-page/emergency-register-page.component';

const routes: Routes = [
    {
        path: '',
        data: { shouldReuse: true, key: 'emergency-register' },
        component: EmergencyRegisterPageComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class EmergencyRegisterPageRoutingModule {}
