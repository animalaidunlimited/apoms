import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RotaSettingsComponent } from './rota-settings.component';
import { MaterialModule } from 'src/app/material-module';
import { RotaSettingsComponentRoutingModule } from './rota-settings-routing.module';
import { RotationAreaEditorComponent } from './components/rotation-area-editor/rotation-area-editor.component';
import { RotationRoleEditorComponent } from './components/rotation-role-editor/rotation-role-editor.component';
import { GenericTableComponent } from './components/generic-table/generic-table.component';
import { GenericColumnHeadingFormatterPipe } from './pipes/generic-column-heading-formatter.pipe';
import { GenericColumnCellPipe } from './pipes/generic-column-cell.pipe';

@NgModule({
  imports: [

  CommonModule,
    RotaSettingsComponentRoutingModule,
    MaterialModule
  ],
  declarations: [
    RotaSettingsComponent,
    RotationRoleEditorComponent,
    RotationAreaEditorComponent,
    GenericTableComponent,
    GenericColumnHeadingFormatterPipe,
    GenericColumnCellPipe
  ]
})
export class RotaSettingsModule { }
