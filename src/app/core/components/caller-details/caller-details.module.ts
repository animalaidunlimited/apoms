import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../../material-module';

import { CallerDetailsComponent } from '../caller-details/caller-details.component';

@NgModule({
    declarations: [CallerDetailsComponent],
    imports: [CommonModule, MaterialModule],
    exports: [CallerDetailsComponent],
})
export class CallerDetailsModule {}
