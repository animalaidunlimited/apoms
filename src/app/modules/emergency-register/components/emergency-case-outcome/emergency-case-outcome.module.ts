import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../../../material-module';
import { EmergencyCaseOutcomeComponent } from './emergency-case-outcome.component';

@NgModule({
    declarations: [EmergencyCaseOutcomeComponent],
    imports: [CommonModule, MaterialModule],
    exports: [EmergencyCaseOutcomeComponent],
})
export class EmergencyCaseOutcomeModule {}
