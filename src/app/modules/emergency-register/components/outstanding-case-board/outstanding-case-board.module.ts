import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { OutstandingCaseBoardComponent } from '../outstanding-case-board/outstanding-case-board.component';

import { FlexLayoutModule } from '@angular/flex-layout';
import { OutstandingCaseMapComponent } from '../outstanding-case-map/outstanding-case-map.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { SearchResultCardModule } from 'src/app/core/components/search-result-card/search-result-card.module';
import { MatChipsModule } from '@angular/material/chips';
import { ChipListType } from '../../pipes/chip-list-type';
import { SharedPipesModule } from 'src/app/shared-pipes.module';
import { EmergencyRegisterAmbulanceModule } from './../emergency-register-ambulance/emergency-register-ambulance.module';
@NgModule({
    declarations: [
        OutstandingCaseBoardComponent,
        OutstandingCaseMapComponent,
        ChipListType
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
    exports: [OutstandingCaseBoardComponent],
})
export class OutstandingCaseBoardModule {}
