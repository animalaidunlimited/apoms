import { CaseListPageComponent } from './case-list-page.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [ {path:'',component:CaseListPageComponent,data:{shouldReuse:true,key:'case-list'}},  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CaseListPageRoutingModule { }
