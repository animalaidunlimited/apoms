import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';

import { SurgeryRecordComponent } from './surgery-record.component';
import { SurgeryRegisterPageRoutingModule } from '../surgery-register-page-routing.module';

@NgModule({
    declarations: [SurgeryRecordComponent],
    imports: [CommonModule, SurgeryRegisterPageRoutingModule, MaterialModule],
    exports: [SurgeryRecordComponent],
})
export class SurgeryRecordModule {}
