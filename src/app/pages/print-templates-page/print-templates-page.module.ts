import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrintTemplatesPageRoutingModule } from './print-templates-page-routing.module';
import { PrintTemplatesPageComponent } from './print-templates-page.component';
import { MaterialModule } from 'src/app/material-module';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
  declarations: [PrintTemplatesPageComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    PrintTemplatesPageRoutingModule
  ]
})
export class PrintTemplatesPageModule { }
