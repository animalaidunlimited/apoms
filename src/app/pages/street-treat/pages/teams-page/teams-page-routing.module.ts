import { TeamsPageComponent } from './teams-page.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        component: TeamsPageComponent,
        data: { shouldReuse: true, key: 'teams' },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TeamsPageRoutingModule {}