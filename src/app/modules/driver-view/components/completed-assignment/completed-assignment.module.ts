import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompletedAssignmentRoutingModule } from './completed-assignment-routing.module';
import { MaterialModule } from 'src/app/material-module';
import { BrowserModule } from '@angular/platform-browser';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CompletedAssignmentRoutingModule,
    MaterialModule,
    // BrowserModule
  ]
})
export class CompletedAssignmentModule { }
