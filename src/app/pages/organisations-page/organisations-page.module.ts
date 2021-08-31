import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganisationsPageRoutingModule } from './organisations-page-routing.module';
import { OrganisationsPageComponent } from './organisations-page.component';
import { MaterialModule } from './../../material-module';
import { GoogleMapsModule } from '@angular/google-maps';
import { ProblemComponent } from './problem/problem.component';
@NgModule({
    declarations: [
        OrganisationsPageComponent,
        ProblemComponent
    ],
    imports: [
    
    CommonModule, 
        OrganisationsPageRoutingModule,
        MaterialModule,
        GoogleMapsModule
    ],
})
export class OrganisationsPageModule {}
