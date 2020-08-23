import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material-module';

import { GoogleMapsModule } from '@angular/google-maps';

import { LocationDetailsComponent } from '../location-details/location-details.component';

@NgModule({
    declarations: [LocationDetailsComponent],
    imports: [
                CommonModule,
                MaterialModule,
                GoogleMapsModule
            ],
    exports: [LocationDetailsComponent],
    entryComponents: [],
})
export class LocationDetailsModule {}
