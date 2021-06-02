import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../../material-module';
import { ReleaseAssignComponent } from './release-assign.component';


@NgModule({
    declarations: [ReleaseAssignComponent],
    imports: [
                CommonModule,
                MaterialModule
            ],
    exports: [ReleaseAssignComponent]
})
export class ReleaseAssignModule {}
