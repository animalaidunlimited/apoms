import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StreetTreatSearchComponent } from './streettreat-search.component';
import { MaterialModule } from 'src/app/material-module';
import { SearchFieldModule } from 'src/app/core/components/search-field/search-field.module';


@NgModule({
    declarations: [
          StreetTreatSearchComponent,
        ],
    imports: [
        CommonModule,
        MaterialModule,
        SearchFieldModule,
    ],
    exports: [
      StreetTreatSearchComponent
    ]
})

export class StreetTreatSeachModule {}
