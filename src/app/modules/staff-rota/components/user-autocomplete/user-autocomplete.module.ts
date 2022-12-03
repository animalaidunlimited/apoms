import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { UserAutocompleteComponent } from './user-autocomplete.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule
  ],
  declarations: [
    UserAutocompleteComponent
  ],
  exports: [
    UserAutocompleteComponent
  ]
})
export class UserAutoCompleteModule { }
