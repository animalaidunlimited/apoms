import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddSearchMediaDialogComponent } from './add-search-media-dialog.component';

@NgModule({
    declarations:[
        AddSearchMediaDialogModule,
    ],
    imports: [
        CommonModule,
        ],
    exports: [AddSearchMediaDialogComponent],
})
export class AddSearchMediaDialogModule {}