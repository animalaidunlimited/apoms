import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MediaThumbnailsModule } from '../media-thumbnails/media-thumbnails.module';
import { MediaGalleryDialogComponent } from './media-gallery-dialog.component';



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
export class MediaGalleryModule { }