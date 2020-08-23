import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomePageRoutingModule } from './home-page-routing.module';
import { HomePageComponent } from './home-page.component';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
    declarations: [HomePageComponent],
    imports: [CommonModule, HomePageRoutingModule, FlexLayoutModule],
})
export class HomePageModule {}
