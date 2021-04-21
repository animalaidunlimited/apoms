import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { CensusPageComponent } from './pages/census-page.component';
import { CensusPageRoutingModule } from './census-page-routing.module';
import { CensusRecordModule } from './components/census-record/census-record.module';

@NgModule({
    declarations: [CensusPageComponent],
    imports: [
            CommonModule, 
            CensusPageRoutingModule, 
            MaterialModule,
            CensusRecordModule
        ],
})
export class CensusPageModule {}
