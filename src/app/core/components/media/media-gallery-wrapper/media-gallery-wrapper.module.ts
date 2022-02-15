
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaterialModule } from 'src/app/material-module';
import { MediaGalleryModule } from '../media-gallery/media-gallery.module';
import { GalleryWrapperComponent } from './media-gallery-wrapper.component';

@NgModule({
    declarations: [GalleryWrapperComponent],
    imports: [
        CommonModule,
        MaterialModule,
        MediaGalleryModule
    ],
    exports: [GalleryWrapperComponent],
})
export class GalleryWrapperModule {}
