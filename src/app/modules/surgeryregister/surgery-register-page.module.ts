import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SurgeryRegisterPageRoutingModule } from './surgery-register-page-routing.module';
import { SurgeryRegisterPageComponent } from './pages/surgery-register-page/surgery-register-page.component';
import { MaterialModule } from 'src/app/material-module';
import { SurgeryRecordModule } from './components/surgery-record.module';

@NgModule({
    declarations: [SurgeryRegisterPageComponent],
    imports: [
        CommonModule,
        SurgeryRegisterPageRoutingModule,
        MaterialModule,
        SurgeryRecordModule,
        
    ],
})
export class SurgeryRegisterPageModule {}
