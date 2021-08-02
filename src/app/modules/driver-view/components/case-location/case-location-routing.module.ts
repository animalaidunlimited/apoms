import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CaseLocationComponent } from './case-location.component';

const routes: Routes = [{
  path: '',
  component: CaseLocationComponent ,
  data: { shouldReuse: true, key: 'case-location' },
},];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CaseLocationRoutingModule { }
