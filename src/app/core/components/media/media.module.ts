import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material-module';
import { MediaPreviewComponent } from './media-preview/media-preview.component';
import { MediaGalleryDialogComponent } from './media-gallery-dialog/media-gallery-dialog.component';
import { MediaThumbnailsModule } from './media-thumbnails/media-thumbnails.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SharedPipesModule } from 'src/app/shared-pipes.module';



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
    MediaThumbnailsModule
  ]
})
export class MediaModule { }
