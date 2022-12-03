import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaGalleryComponent } from './media-gallery.component';
import { MaterialModule } from 'src/app/material-module';
import { MediaThumbnailsModule } from '../media-thumbnails/media-thumbnails.module';
@NgModule({
  declarations: [
    MediaGalleryComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    MediaThumbnailsModule
  ],
  exports: [MediaGalleryComponent]
})
export class MediaGalleryModule { }