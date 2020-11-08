import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersPageRoutingModule } from './users-page-routing.module';
import { UsersPageComponent } from './users-page.component';
import { MaterialModule } from 'src/app/material-module';

@NgModule({
    declarations: [UsersPageComponent],
    imports: [CommonModule, UsersPageRoutingModule, MaterialModule],
    exports: [UsersPageComponent]
})
export class UsersPageModule {}
