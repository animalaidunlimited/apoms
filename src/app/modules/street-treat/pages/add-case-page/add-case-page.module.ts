import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddCasePageRoutingModule } from './add-case-page-routing.module';
import { AddCasePageComponent } from './add-case-page.component';

@NgModule({
    declarations: [AddCasePageComponent],
    imports: [CommonModule, AddCasePageRoutingModule],
})
export class AddCasePageModule {}
