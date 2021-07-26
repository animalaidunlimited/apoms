import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { OutstandingCaseMapComponent } from './outstanding-case-map.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { GoogleMapsModule } from '@angular/google-maps';

import { OutstandingCaseBoardAmbulanceModule } from '../outstanding-case-board-ambulance/outstanding-case-board-ambulance.module';

@NgModule({
    declarations: [
        OutstandingCaseMapComponent,
    ],
    imports: [

    CommonModule,
        MaterialModule,
        FlexLayoutModule,
        GoogleMapsModule,
        OutstandingCaseBoardAmbulanceModule
    ],
    providers:[

    ],
    exports: [OutstandingCaseMapComponent],
})
export class OutstandingCaseMapModule {}
