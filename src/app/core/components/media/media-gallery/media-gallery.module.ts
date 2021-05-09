import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaGalleryComponent } from './media-gallery.component';
import { MaterialModule } from 'src/app/material-module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MediaThumbnailsModule } from '../media-thumbnails/media-thumbnails.module';
@NgModule({
  declarations: [
    MediaGalleryComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    MediaThumbnailsModule
  ],
  exports: [MediaGalleryComponent]
})
export class MediaGalleryModule { }