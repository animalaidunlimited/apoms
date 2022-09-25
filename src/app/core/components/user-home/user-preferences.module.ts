import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { UserPreferencesComponent } from './user-preferences/user-preferences.component';
import { UserNotificationsComponent } from './user-notifications/user-notifications.component';
import { SharedPipesModule } from './../../../shared-pipes.module';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    SharedPipesModule
  ],
  declarations: [UserPreferencesComponent, UserNotificationsComponent],
  exports: [UserPreferencesComponent, UserNotificationsComponent]
})

export class UserPreferencesModule { }
