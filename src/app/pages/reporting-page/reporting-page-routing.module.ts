import { ReportingPageComponent } from './reporting-page.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [ {path:'',component:ReportingPageComponent,data:{shouldReuse:true,key:'reporting'}},  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportingPageRoutingModule { }
