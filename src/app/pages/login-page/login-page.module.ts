import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginPageRoutingModule } from './login-page-routing.module';
import { LoginPageComponent } from './login-page.component';
import { LogoModule } from '../../core/components/logo/logo.module';
import { MaterialModule } from 'src/app/material-module';

@NgModule({
    declarations: [LoginPageComponent],
    imports: [
        CommonModule,
        MaterialModule,
        LoginPageRoutingModule,
        LogoModule
    ],
})
export class LoginPageModule {}
