import { NgModule } from '@angular/core';
import { TimeAgoPipe } from './core/components/media/media-preview/time-ago.pipe';

@NgModule({
  imports: [
  ],
  declarations: [
    TimeAgoPipe
  ],
  exports: [
    TimeAgoPipe
  ]
})

export class SharedPipesModule {}