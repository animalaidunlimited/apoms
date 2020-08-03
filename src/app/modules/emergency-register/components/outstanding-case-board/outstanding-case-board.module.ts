import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { OutstandingCaseBoardComponent } from '../outstanding-case-board/outstanding-case-board.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { OutstandingCaseMapComponent } from '../outstanding-case-map/outstanding-case-map.component';
import { GoogleMapsModule } from '@angular/google-maps';

@NgModule({
    declarations: [
        OutstandingCaseBoardComponent,
        OutstandingCaseMapComponent
    ],
    imports: [
        CommonModule,
        MaterialModule,
        FlexLayoutModule,
        GoogleMapsModule
    ],
    exports: [OutstandingCaseBoardComponent],
})
export class OutstandingCaseBoardModule {}
