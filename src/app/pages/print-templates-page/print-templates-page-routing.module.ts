import { PrintTemplatesPageComponent } from './print-templates-page.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [ {path:'',component:PrintTemplatesPageComponent,data:{shouldReuse:true,key:'print-templates'}},  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrintTemplatesPageRoutingModule { }
