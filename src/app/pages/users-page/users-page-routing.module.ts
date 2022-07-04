import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersPageComponent } from './components/users-page.component';

const routes: Routes = [
    {
        path: '',
        component: UsersPageComponent,
        data: { shouldReuse: true, key: 'users' },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class UsersPageRoutingModule {}
