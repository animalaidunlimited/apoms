import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersPageRoutingModule } from './users-page-routing.module';
import { MaterialModule } from 'src/app/material-module';
import { UsersPageComponent } from './components/users-page.component';

@NgModule({
    declarations: [UsersPageComponent],
    imports: [CommonModule, UsersPageRoutingModule, MaterialModule],
    exports: [UsersPageComponent]
})
export class UsersPageModule {}
