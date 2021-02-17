import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TeamsPageRoutingModule } from './teams-page-routing.module';
import { TeamsPageComponent } from './teams-page.component';
import { MaterialModule } from 'src/app/material-module';
@NgModule({
    declarations: [TeamsPageComponent],
    imports: [
        CommonModule, 
        TeamsPageRoutingModule,
        MaterialModule
    ],
})
export class TeamsPageModule {}