import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';

import { SurgeryRegisterPageRoutingModule } from 'src/app/modules/surgeryregister/surgery-register-page-routing.module';
import { SurgeryRecordComponent } from './surgery-record.component';

@NgModule({
    declarations: [SurgeryRecordComponent],
    imports: [CommonModule, SurgeryRegisterPageRoutingModule, MaterialModule],
    exports: [SurgeryRecordComponent],
})
export class SurgeryRecordModule {}
