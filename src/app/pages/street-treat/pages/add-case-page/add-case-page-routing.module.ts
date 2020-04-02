import { AddCasePageComponent } from './add-case-page.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [ {path:'',component:AddCasePageComponent,data:{shouldReuse:true,key:'add-case'}},  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AddCasePageRoutingModule { }
