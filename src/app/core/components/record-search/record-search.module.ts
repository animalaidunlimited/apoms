import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../../material-module';

import { RecordSearchComponent } from '../record-search/record-search.component';
import { SearchResultCardModule } from '../search-result-card/search-result-card.module';
import { SearchFieldModule } from '../search-field/search-field.module';

@NgModule({
    declarations: [
        RecordSearchComponent
        ],
    imports: [
        CommonModule,
        MaterialModule,
        SearchResultCardModule,
        SearchFieldModule
    ],
    exports: [
        RecordSearchComponent
    ]
})
export class RecordSearchModule {}
