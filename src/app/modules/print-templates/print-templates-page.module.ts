import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PrintTemplatesPageRoutingModule } from './print-templates-page-routing.module';
import { PrintTemplatesPageComponent } from './pages/print-templates-page.component';

@NgModule({
  declarations: [
    PrintTemplatesPageComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    PrintTemplatesPageRoutingModule
  ]
})
export class PrintTemplatesPageModule { }
