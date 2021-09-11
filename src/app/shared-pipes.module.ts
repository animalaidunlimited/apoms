
import { NgModule } from '@angular/core';
import { TimeAgoPipe } from './core/components/media/media-preview/time-ago.pipe';
import { ChipListType } from './modules/emergency-register/pipes/chip-list-type';

@NgModule({
  imports: [
  ],
  declarations: [
    TimeAgoPipe,
    ChipListType
  ],
  exports: [
    TimeAgoPipe,
    ChipListType
  ]
})

export class SharedPipesModule {}