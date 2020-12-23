import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../../material-module';

import { CallerDetailsComponent } from '../caller-details/caller-details.component';
import { CallerAutocompleteComponent } from '../caller-autocomplete/caller-autocomplete.component';

@NgModule({
    declarations: [CallerDetailsComponent, CallerAutocompleteComponent],
    imports: [CommonModule, MaterialModule],
    exports: [CallerDetailsComponent]
})
export class CallerDetailsModule {}
