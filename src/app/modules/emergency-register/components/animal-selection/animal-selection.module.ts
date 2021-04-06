import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../../../material-module';
import { AnimalSelectionComponent } from './animal-selection.component';

@NgModule({
    declarations: [AnimalSelectionComponent],
    imports: [
        CommonModule,
        MaterialModule
    ],
    exports:[AnimalSelectionComponent]
})
export class AnimalSelectionModule {}
