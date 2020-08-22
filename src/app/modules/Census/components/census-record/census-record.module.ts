import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { CensusPageRoutingModule } from 'src/app/modules/Census/census-page-routing.module';
import { CensusRecordComponent } from './census-record.component';

@NgModule({
    declarations: [CensusRecordComponent],
    imports: [CommonModule, CensusPageRoutingModule, MaterialModule],
    exports:[CensusRecordComponent]
})
export class CensusRecordModule {}
