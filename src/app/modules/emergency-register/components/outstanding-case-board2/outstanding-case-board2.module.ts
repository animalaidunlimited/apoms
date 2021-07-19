import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { OutstandingCaseBoard2Component } from '../outstanding-case-board2/outstanding-case-board2.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { GoogleMapsModule } from '@angular/google-maps';
import { SearchResultCardModule } from 'src/app/core/components/search-result-card/search-result-card.module';
import { MatChipsModule } from '@angular/material/chips';
import { SharedPipesModule } from 'src/app/shared-pipes.module';
import { EmergencyRegisterAmbulanceModule } from './../emergency-register-ambulance/emergency-register-ambulance.module';
@NgModule({
    declarations: [

        OutstandingCaseBoard2Component
    ],
    imports: [

    CommonModule,
        MaterialModule,
        FlexLayoutModule,
        GoogleMapsModule,
        SearchResultCardModule,
        SharedPipesModule,
        MatChipsModule,
        EmergencyRegisterAmbulanceModule
    ],
    providers:[

    ],
    exports: [OutstandingCaseBoard2Component],
})
export class OutstandingCaseBoard2Module {}
