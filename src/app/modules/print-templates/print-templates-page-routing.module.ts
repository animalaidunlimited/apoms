import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PrintTemplatesPageComponent } from './pages/print-templates-page.component';


const routes: Routes = [ {path:'',component:PrintTemplatesPageComponent,data:{shouldReuse:true,key:'print-templates'}},  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PrintTemplatesPageRoutingModule { }
