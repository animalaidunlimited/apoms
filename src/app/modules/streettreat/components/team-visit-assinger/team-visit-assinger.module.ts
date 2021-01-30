import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../../../material-module';
import { TeamVisitAssingerComponent } from './team-visit-assinger.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
    declarations: [
        TeamVisitAssingerComponent
    ],
    imports: [
        CommonModule,
        MaterialModule,
        GoogleMapsModule,
        NgxChartsModule
        ],
    exports: [TeamVisitAssingerComponent]
})
export class TeamVisitAssingerModule {}