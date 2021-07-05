import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompletedAssignmentComponent } from './completed-assignment.component';

const routes: Routes = [    
  {
    path: '',
    component: CompletedAssignmentComponent,
    data: { shouldReuse: true, key: 'completed-assignments' },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompletedAssignmentRoutingModule { }
