import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganisationsPageRoutingModule } from './organisations-page-routing.module';
import { OrganisationsPageComponent } from './organisations-page.component';

@NgModule({
  declarations: [OrganisationsPageComponent],
  imports: [
    CommonModule,
    OrganisationsPageRoutingModule
  ]
})
export class OrganisationsPageModule { }
