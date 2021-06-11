import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { MediaPreviewComponent } from './media-preview/media-preview.component';
import { MediaGalleryDialogComponent } from './media-gallery-dialog/media-gallery-dialog.component';
import { MediaThumbnailsModule } from './media-thumbnails/media-thumbnails.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedPipesModule } from 'src/app/shared-pipes.module';
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig, HammerModule } from '@angular/platform-browser';
import * as Hammer from 'hammerjs';

export class MyHammerConfig extends HammerGestureConfig {
  overrides = {
    swipe: { 
      direction: Hammer.DIRECTION_ALL 
    },
  };
}

@NgModule({
  declarations: [
    MediaPreviewComponent,
    MediaGalleryDialogComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    SharedPipesModule,
    MediaThumbnailsModule,
    HammerModule
  ],
  providers: [{ provide: HAMMER_GESTURE_CONFIG, useClass: MyHammerConfig }]
})
export class MediaModule { }
