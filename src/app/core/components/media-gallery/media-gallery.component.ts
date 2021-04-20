import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { MediaItem } from '../../models/media';
import { MediaDialogComponent } from '../media-dialog/media-dialog.component';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'media-gallery',
  templateUrl: './media-gallery.component.html',
  styleUrls: ['./media-gallery.component.scss']
})
export class MediaGalleryComponent implements OnInit,OnChanges {
  @Input() images!:any[];
  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
    
  }

  ngOnChanges(): void {
   this.images = this.images;
  }

  openMediaDialog(): void{

    const dialogRef = this.dialog.open(MediaDialogComponent, {
        minWidth: '50%',
       /*  data: {
            tagNumber: this.recordForm.get('patientDetails.tagNumber')?.value,
            patientId: this.recordForm.get('patientDetails.patientId')?.value,
        } */
    });

    // TODO: Add the service to update the datetime in the image description by emmiting a behavior subject.
    /* dialogRef.afterClosed()
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(updatedMedia => {

        if(updatedMedia){
            if(updatedMedia.isPrimary === true){

                this.profileUrl = updatedMedia.localURL || updatedMedia.remoteURL || this.profileUrl;
            }
        }
    }); */

}

}
