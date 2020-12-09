import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { StreettreatSearchComponent } from './streettreat-search.component';
import { MaterialModule } from 'src/app/material-module'


@NgModule({
    declarations: [
          StreettreatSearchComponent,
        ],
    imports: [
        CommonModule,
        MaterialModule
    ],
    exports: [
      StreettreatSearchComponent
    ]
})
export class StreetTreatSeachModule {}
