import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../../../material-module';
import { TeamVisitAssingerComponent } from './team-visit-assinger.component';
import { GoogleMapsModule } from '@angular/google-maps';


@NgModule({
    declarations: [
        TeamVisitAssingerComponent
    ],
    imports: [
        CommonModule,
        MaterialModule,
        GoogleMapsModule
        ],
    exports: [TeamVisitAssingerComponent]
})
export class TeamVisitAssingerModule {}