import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { TimeAgoPipe } from './media-preview/time-ago.pipe';
import { MediaPreviewComponent } from './media-preview/media-preview.component';
import { MediaGalleryDialogComponent } from './media-gallery-dialog/media-gallery-dialog.component';
import { MediaThumbnailsModule } from './media-thumbnails/media-thumbnails.module';
import { FlexLayoutModule } from '@angular/flex-layout';



@NgModule({
  declarations: [
    MediaPreviewComponent,
    MediaGalleryDialogComponent,
    TimeAgoPipe
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    MediaThumbnailsModule
  ]
})
export class MediaModule { }
