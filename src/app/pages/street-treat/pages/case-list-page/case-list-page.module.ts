import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CaseListPageRoutingModule } from './case-list-page-routing.module';
import { CaseListPageComponent } from './case-list-page.component';

@NgModule({
  declarations: [CaseListPageComponent],
  imports: [
    CommonModule,
    CaseListPageRoutingModule
  ]
})
export class CaseListPageModule { }
