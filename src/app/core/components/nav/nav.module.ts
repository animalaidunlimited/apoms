import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from './nav.component';
import { RouterModule } from '@angular/router';
import { LogoModule } from '../logo/logo.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NavMenuItemComponent } from './nav-menu-item/nav-menu-item.component';
import { NavToolbarComponent } from './nav-toolbar/nav-toolbar.component';
import { MaterialModule } from 'src/app/material-module';

@NgModule({
    declarations: [NavComponent, NavMenuItemComponent, NavToolbarComponent],
    imports: [
        CommonModule,
        RouterModule,
        LogoModule,
        FlexLayoutModule,
        MaterialModule,
    ],
})
export class NavModule {}
