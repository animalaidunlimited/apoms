import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { StreetTreatSearchComponent } from './streettreat-search.component';
import { MaterialModule } from 'src/app/material-module'


@NgModule({
    declarations: [
          StreetTreatSearchComponent,
        ],
    imports: [
        CommonModule,
        MaterialModule
    ],
    exports: [
      StreetTreatSearchComponent
    ]
})
export class StreetTreatSeachModule {}
