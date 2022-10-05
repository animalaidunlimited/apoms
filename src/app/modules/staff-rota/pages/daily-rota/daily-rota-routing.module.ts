import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DailyRotaComponent } from './daily-rota.component';


const routes: Routes = [
  {
    path: '',
    component: DailyRotaComponent,
    data: { shouldReuse: true, key: 'daily-rotation' },
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DailyRotaComponentRoutingModule { }
