import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../../../material-module';
import { VehicleVisitAssignerComponent } from './vehicle-visit-assigner.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
    declarations: [
        VehicleVisitAssignerComponent
    ],
    imports: [
        CommonModule,
        MaterialModule,
        GoogleMapsModule,
        NgxChartsModule
        ],
    exports: [VehicleVisitAssignerComponent]
})
export class VehicleVisitAssignerModule {}