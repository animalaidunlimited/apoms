import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddSearchMediaDialogComponent } from './add-search-media-dialog.component';
import { MaterialModule } from 'src/app/material-module';
import { SearchFieldModule } from 'src/app/core/components/search-field/search-field.module';


@NgModule({
    declarations:[AddSearchMediaDialogComponent],
    imports: [
        CommonModule,
        MaterialModule,
        SearchFieldModule
        ],
    exports: [AddSearchMediaDialogComponent]
})

export class AddSearchMediaDialogModule {}