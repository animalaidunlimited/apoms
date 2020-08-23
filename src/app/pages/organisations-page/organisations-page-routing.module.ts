import { OrganisationsPageComponent } from './organisations-page.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        component: OrganisationsPageComponent,
        data: { shouldReuse: true, key: 'organisations' },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class OrganisationsPageRoutingModule {}
