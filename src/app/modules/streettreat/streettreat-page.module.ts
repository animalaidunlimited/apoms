import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StreetTreatPageRoutingModule } from './streettreat-page-routing.module';
import { StreetTreatPageComponent } from './pages/streettreat-page.component';
import { StreetTreatTabBarComponent } from './components/streettreat-tab-bar/streettreat-tab-bar.component';
import { MaterialModule } from 'src/app/material-module';
import { RecordSearchModule } from 'src/app/core/components/record-search/record-search.module';
import { SearchResultCardModule } from 'src/app/core/components/search-result-card/search-result-card.module';
import { SearchFieldModule } from 'src/app/core/components/search-field/search-field.module';
import { StreetTreatRecordComponent } from './components/streettreat-record/streettreat-record.component';
import { PatientVisitDetailsModule } from '../../core/components/patient-visit-details/patient-visit-details.module';
import { CallerDetailsModule } from 'src/app/core/components/caller-details/caller-details.module';
import { LocationDetailsModule } from 'src/app/core/components/location-details/location-details.module';
import { AnimalHeaderModule } from '../hospital-manager/components/animal-header/animal-header.module';
import { VehicleVisitAssignerModule } from './components/vehicle-visit-assigner/vehicle-visit-assigner.module';
import { StreetTreatSearchModule } from './components/streettreat-search/streettreat-search.module';



@NgModule({
  declarations: [
    StreetTreatPageComponent,
    StreetTreatTabBarComponent,
    StreetTreatRecordComponent
  ],
  imports: [
    CommonModule,
    StreetTreatPageRoutingModule,
    MaterialModule,
    RecordSearchModule,
    SearchResultCardModule,
    SearchFieldModule,
    PatientVisitDetailsModule,
    CallerDetailsModule,
    LocationDetailsModule,
    AnimalHeaderModule,
    VehicleVisitAssignerModule,
    StreetTreatSearchModule
  ]
})
export class StreetTreatPageModule { }
