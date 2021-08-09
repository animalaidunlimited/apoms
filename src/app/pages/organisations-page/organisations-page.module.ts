import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganisationsPageRoutingModule } from './organisations-page-routing.module';
import { OrganisationsPageComponent } from './organisations-page.component';
import { MaterialModule } from './../../material-module';
@NgModule({
    declarations: [
        OrganisationsPageComponent
    ],
    imports: [
    
    CommonModule, 
        OrganisationsPageRoutingModule,
        MaterialModule
    ],
})
export class OrganisationsPageModule {}
