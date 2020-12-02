import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { SearchFieldComponent } from './search-field.component';

@NgModule({
    declarations:[SearchFieldComponent],
    imports: [
        CommonModule,
        MaterialModule
        ],
    exports: [SearchFieldComponent]
})
export class SearchFieldModule {}