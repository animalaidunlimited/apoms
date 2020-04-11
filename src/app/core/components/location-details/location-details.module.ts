import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material-module';

import { LocationDetailsComponent } from '../location-details/location-details.component'

@NgModule({
    declarations: [
        LocationDetailsComponent

    ],
    imports: [
        CommonModule,
        MaterialModule


    ],
    exports: [
        LocationDetailsComponent
    ],
    entryComponents: [
      ],
})
export class LocationDetailsModule {}