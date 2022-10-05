import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RotaSettingsComponent } from './rota-settings.component';


const routes: Routes = [
  {
    path: '',
    component: RotaSettingsComponent,
    data: { shouldReuse: true, key: 'rota-settings' },
},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RotaSettingsComponentRoutingModule { }
