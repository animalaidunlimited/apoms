import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { CensusPageRoutingModule } from './census-page-routing.module';
import { CensusPageComponent } from './census-page.component';
import { CensusRecordModule } from "src/app/modules/Census/components/census-record/census-record.module";

@NgModule({
    declarations: [CensusPageComponent],

    imports: [
        CommonModule,
        CensusPageRoutingModule,
        MaterialModule
    ],
    exports: [
        CensusPageComponent
    ]
})
export class CensusPageModule {}
