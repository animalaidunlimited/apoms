import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../../../material-module';
import { VehicleVisitAssingerComponent } from './vehicle-visit-assinger.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
    declarations: [
        VehicleVisitAssingerComponent
    ],
    imports: [
        CommonModule,
        MaterialModule,
        GoogleMapsModule,
        NgxChartsModule
        ],
    exports: [VehicleVisitAssingerComponent]
})
export class VehicleVisitAssingerModule {}