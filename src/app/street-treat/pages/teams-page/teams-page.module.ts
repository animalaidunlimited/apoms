import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeamsPageRoutingModule } from './teams-page-routing.module';
import { TeamsPageComponent } from './teams-page.component';

@NgModule({
  declarations: [TeamsPageComponent],
  imports: [
    CommonModule,
    TeamsPageRoutingModule
  ]
})
export class TeamsPageModule { }
