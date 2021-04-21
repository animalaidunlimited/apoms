import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MediaDialogComponent } from '../media-dialog/media-dialog.component';
import { MediaGalleryDialogComponent } from '../media-gallery-dialog/media-gallery-dialog.component';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'media-gallery',
  templateUrl: './media-gallery.component.html',
  styleUrls: ['./media-gallery.component.scss']
})
export class MediaGalleryComponent implements OnInit, OnDestroy, OnChanges {

  private ngUnsubscribe = new Subject();
  
  @Input() images!:any[];
  @Input() galleryData!:AbstractControl | null;
  constructor(public dialog: MatDialog) { }

  ngOnChanges(changes: SimpleChanges): void {

  }

  ngOnInit(): void {
   
    console.log(this.galleryData?.get('tagNumber')?.value);
  }

 

  openGalleryDialog($event: Event): void{
    $event.preventDefault();
    const dialogRef = this.dialog.open(MediaGalleryDialogComponent, {
        minWidth: '80vw',
        data: {
            mediaGallery: this.images
        }
    });
  }
  openMediaDialog(): void{

      const dialogRef = this.dialog.open(MediaDialogComponent, {
          minWidth: '50%',
          data: {
              tagNumber: this.galleryData?.get('tagNumber')?.value,
              patientId: this.galleryData?.get('patientId')?.value,
          }
      });

      // TODO: Add the service to update the datetime in the image description by emmiting a behavior subject.
      dialogRef.afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      // tslint:disable-next-line: deprecation
      .subscribe(updatedMedia => {

          if(updatedMedia){
              if(updatedMedia.isPrimary === true){

                  // this.profileUrl = updatedMedia.localURL || updatedMedia.remoteURL || this.profileUrl;
              }
          }
      });

  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
