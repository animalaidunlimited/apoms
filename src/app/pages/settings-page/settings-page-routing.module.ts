import { SettingsPageComponent } from './settings-page.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        component: SettingsPageComponent,
        data: { shouldReuse: true, key: 'settings' },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SettingsPageRoutingModule {}
