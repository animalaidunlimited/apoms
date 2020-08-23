import { CensusPageComponent } from './census-page.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        component: CensusPageComponent,
        data: { shouldReuse: true, key: 'census' },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CensusPageRoutingModule {}
