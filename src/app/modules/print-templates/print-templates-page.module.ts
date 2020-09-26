import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PrintTemplatesPageRoutingModule } from './print-templates-page-routing.module';
import { PrintTemplatesPageComponent } from './pages/print-templates-page.component';
import { PrintElementFilter } from './pipes/print-element-filter';
import { PrintWrapperComponent } from './components/print-wrapper/print-wrapper.component';
import { PrintContentComponent } from './components/print-content/print-content.component';

@NgModule({
  declarations: [
    PrintTemplatesPageComponent,
    PrintElementFilter,
    PrintWrapperComponent,
    PrintContentComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    PrintTemplatesPageRoutingModule
  ]
})
export class PrintTemplatesPageModule { }
