import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MediaGalleryDialogComponent } from './media-gallery-dialog.component';
import { MediaThumbnailsModule } from '../media-thumbnails/media-thumbnails.module';



@NgModule({
  declarations: [
    MediaGalleryDialogComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    MediaThumbnailsModule
  ],
  exports: [MediaGalleryDialogComponent]
})
export class MediaGalleryDialogModule { }
