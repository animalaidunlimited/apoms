import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../../material-module';

import { RecordSearchComponent } from '../record-search/record-search.component'

@NgModule({
    declarations: [        
        RecordSearchComponent,
           
    ],
    imports: [
        CommonModule,
        MaterialModule      
    ],
    exports: [
        RecordSearchComponent
    ],
    entryComponents: [
      ],
})
export class RecordSearchModule {}