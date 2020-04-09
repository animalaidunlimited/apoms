import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../../material-module';
import { RescueDetailsComponent } from './rescue-details.component';


@NgModule({
    declarations: [
        RescueDetailsComponent
    ],
    imports: [
        CommonModule,
        MaterialModule
    ],
    exports: [
        RescueDetailsComponent
    ],
})
export class RescueDetailsModule {}