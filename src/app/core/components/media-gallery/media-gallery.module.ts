import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaGalleryComponent } from './media-gallery.component';
import { MaterialModule } from 'src/app/material-module';
import { FlexLayoutModule } from '@angular/flex-layout';



@NgModule({
  declarations: [MediaGalleryComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule
  ],
  exports: [MediaGalleryComponent]
})
export class MediaGalleryModule { }
