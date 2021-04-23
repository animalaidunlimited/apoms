import { MediaGalleryComponent } from './media-gallery/media-gallery.component';
import { MediaGalleryModule } from './media-gallery/media-gallery.module';
import { MediaThumbnailsComponent } from './media-thumbnails/media-thumbnails.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaGalleryDialogComponent } from './media-gallery-dialog/media-gallery-dialog.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from 'src/app/material-module';
import { MediaThumbnailsModule } from './media-thumbnails/media-thumbnails.module';


@NgModule({
  declarations: [
    MediaGalleryDialogComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    MediaGalleryModule,
    MediaThumbnailsModule
  ]
})
export class MediaModule { }