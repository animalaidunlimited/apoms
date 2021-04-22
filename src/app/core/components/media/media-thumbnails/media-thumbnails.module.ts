import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaThumbnailsComponent } from './media-thumbnails.component';



@NgModule({
  declarations: [MediaThumbnailsComponent],
  imports: [
    CommonModule
  ],
  exports:[
    MediaThumbnailsComponent
  ]
})
export class MediaThumbnailsModule { }
