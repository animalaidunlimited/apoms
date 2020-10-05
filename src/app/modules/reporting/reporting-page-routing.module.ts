import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportingPageComponent } from './pages/reporting-page/reporting-page.component';

const routes: Routes = [
    {
        path: '',
        component: ReportingPageComponent,
        data: { shouldReuse: true, key: 'reporting' },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ReportingPageRoutingModule {}
