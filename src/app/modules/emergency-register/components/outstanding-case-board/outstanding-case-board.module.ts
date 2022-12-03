import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { OutstandingCaseBoardComponent } from './outstanding-case-board.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { SearchResultCardModule } from 'src/app/core/components/search-result-card/search-result-card.module';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { SharedPipesModule } from 'src/app/shared-pipes.module';
import { OutstandingCaseBoardAmbulanceModule } from '../outstanding-case-board-ambulance/outstanding-case-board-ambulance.module';

import { OutstandingCaseMapModule } from '../outstanding-case-map/outstanding-case-map.module';
import { OutstandingCaseBoardCasePanelModule } from '../outstanding-case-board-case-panel/outstanding-case-board-case-panel.module';

@NgModule({
    declarations: [
        OutstandingCaseBoardComponent,
    ],
    imports: [

    CommonModule,
        MaterialModule,
        GoogleMapsModule,
        SearchResultCardModule,
        SharedPipesModule,
        MatChipsModule,
        OutstandingCaseBoardAmbulanceModule,
        OutstandingCaseBoardCasePanelModule,
        OutstandingCaseMapModule
    ],
    providers:[

    ],
    exports: [OutstandingCaseBoardComponent],
})
export class OutstandingCaseBoardModule {}
