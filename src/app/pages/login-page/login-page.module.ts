import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginPageRoutingModule } from './login-page-routing.module';
import { LoginPageComponent } from './login-page.component';
import { LogoModule } from '../../core/components/logo/logo.module';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material-module';

@NgModule({
    declarations: [LoginPageComponent],
    imports: [
        CommonModule,
        MaterialModule,
        LoginPageRoutingModule,
        LogoModule,
        MatCardModule,
        MatInputModule,
        MatButtonModule,
        FlexLayoutModule,
        FormsModule,
    ],
})
export class LoginPageModule {}
