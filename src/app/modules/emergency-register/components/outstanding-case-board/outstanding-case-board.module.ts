import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { OutstandingCaseBoardComponent } from '../outstanding-case-board/outstanding-case-board.component';

import { FlexLayoutModule } from '@angular/flex-layout';
import { GoogleMapsModule } from '@angular/google-maps';
import { SearchResultCardModule } from 'src/app/core/components/search-result-card/search-result-card.module';
import { MatChipsModule } from '@angular/material/chips';
import { SharedPipesModule } from 'src/app/shared-pipes.module';
import { OutstandingCaseBoardAmbulanceModule } from '../outstanding-case-board-ambulance/outstanding-case-board-ambulance.module';
import { OutstandingCaseMapModule } from '../outstanding-case-map/outstanding-case-map.module';
@NgModule({
    declarations: [
        OutstandingCaseBoardComponent
    ],
    imports: [

CommonModule,
        MaterialModule,
        FlexLayoutModule,
        GoogleMapsModule,
        SearchResultCardModule,
        SharedPipesModule,
        MatChipsModule,
        OutstandingCaseBoardAmbulanceModule,
        OutstandingCaseMapModule
    ],
    providers:[

    ],
    exports: [OutstandingCaseBoardComponent],
})
export class OutstandingCaseBoardModule {}
