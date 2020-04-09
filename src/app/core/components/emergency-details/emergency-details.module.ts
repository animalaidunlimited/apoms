import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../../material-module';

import { EmergencyDetailsComponent } from '../emergency-details/emergency-details.component';

@NgModule({
    declarations: [
        EmergencyDetailsComponent
    ],
    imports: [
        CommonModule,
        MaterialModule
    ],
    exports: [
        EmergencyDetailsComponent
    ],
})
export class EmergencyDetailsModule {}