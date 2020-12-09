import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StreetTreatPageRoutingModule } from './streettreat-page-routing.module';
import { StreetTreatPageComponent } from './pages/streettreat-page.component';
import { StreettreatTabBarComponent } from './components/streettreat-tab-bar/streettreat-tab-bar.component';
import { MaterialModule } from 'src/app/material-module';
import { RecordSearchModule } from 'src/app/core/components/record-search/record-search.module';
import { StreettreatSearchComponent } from './components/streettreat-search/streettreat-search.component';
import { SearchResultCardModule } from 'src/app/core/components/search-result-card/search-result-card.module';
import { SearchFieldModule } from 'src/app/core/components/search-field/search-field.module';

@NgModule({
  declarations: [
    StreetTreatPageComponent, 
    StreettreatTabBarComponent, 
    StreettreatSearchComponent

  ],
  imports: [
    CommonModule,
    StreetTreatPageRoutingModule,
    MaterialModule,
    RecordSearchModule,
    SearchResultCardModule,
    SearchFieldModule
  ]
})
export class StreetTreatPageModule { }
