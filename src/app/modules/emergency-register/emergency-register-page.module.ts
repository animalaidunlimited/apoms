import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmergencyRegisterPageRoutingModule } from './emergency-register-page-routing.module';
import { EmergencyRegisterPageComponent } from './pages/emergency-register-page/emergency-register-page.component';

import { MaterialModule } from '../../material-module';

import { RecordSearchModule } from '../../core/components/record-search/record-search.module';
import { EmergencyRecordComponent } from './components/emergency-record/emergency-record.component'

import { AnimalSelectionComponent } from './components/animal-selection/animal-selection.component'
import { TagNumberDialog } from './components/tag-number-dialog/tag-number-dialog.component'
import { RescueDetailsComponent } from './components/rescue-details/rescue-details.component'
import { CallerDetailsModule} from '../../core/components/caller-details/caller-details.module'
import { LocationDetailsModule} from '../../core/components/location-details/location-details.module'

import { TabBarComponent } from './components/tab-bar/tab-bar.component'

import { FormsModule } from '@angular/forms';

import { DatePipe } from '@angular/common';

@NgModule({
  declarations: [
    EmergencyRegisterPageComponent,
    EmergencyRecordComponent,
    AnimalSelectionComponent,
    TagNumberDialog,
    RescueDetailsComponent,
    TabBarComponent
    
  ],
  providers: [DatePipe],

  entryComponents: [
    TagNumberDialog
  ],

  imports: [
    CommonModule,
    EmergencyRegisterPageRoutingModule,
    MaterialModule,
    RecordSearchModule,
    FormsModule,
    CallerDetailsModule,
    LocationDetailsModule
  ],
  exports: [
  ]
})
export class EmergencyRegisterPageModule { }
