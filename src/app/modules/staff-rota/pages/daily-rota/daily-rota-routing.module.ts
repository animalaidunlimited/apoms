import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserListResolver } from '../../resolvers/user-list.resolver';
import { DailyRotaComponent } from './daily-rota.component';


const routes: Routes = [
  {
    path: '',
    component: DailyRotaComponent,
    data: { shouldReuse: true, key: 'daily-rotation' },
    resolve: { userList : UserListResolver }
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DailyRotaComponentRoutingModule { }
