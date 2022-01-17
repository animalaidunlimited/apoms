import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganisationsPageRoutingModule } from './organisations-page-routing.module';
import { OrganisationsPageComponent } from './organisations-page.component';
import { MaterialModule } from './../../material-module';
import { GoogleMapsModule } from '@angular/google-maps';
import { OrganisationDropdownComponent } from './organisation-dropdown/organisation-dropdown.component';

@NgModule({
    declarations: [
        OrganisationsPageComponent,
        OrganisationDropdownComponent
    ],
    imports: [

    CommonModule,
        OrganisationsPageRoutingModule,
        MaterialModule,
        GoogleMapsModule
    ],
})
export class OrganisationsPageModule {}
