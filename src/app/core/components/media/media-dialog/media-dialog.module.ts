import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MediaThumbnailsModule } from '../media-thumbnails/media-thumbnails.module';
import { MediaDialogComponent } from './media-dialog.component';
import { GalleryWrapperModule } from '../media-gallery-wrapper/media-gallery-wrapper.module';

@NgModule({
  declarations: [
    MediaDialogComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    MediaThumbnailsModule,
    GalleryWrapperModule
  ],
  exports: [MediaDialogComponent]
})
export class MediaMatDialogModule { }