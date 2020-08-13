import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { CensusPageRoutingModule } from './census-page-routing.module';
import { CensusPageComponent } from './census-page.component';

@NgModule({
    declarations: [CensusPageComponent],
    imports: [CommonModule,
        CensusPageRoutingModule,
        MaterialModule],
})
export class CensusPageModule {}
