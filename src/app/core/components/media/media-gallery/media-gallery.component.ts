import { Image, MediaItem,  Gallery} from 'src/app/core/models/media';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MediaGalleryDialogComponent } from '../media-gallery-dialog/media-gallery-dialog.component';
import { DatePipe } from '@angular/common';
import { PatientService } from 'src/app/core/services/patient/patient.service';
import { MediaPreviewComponent } from '../media-preview/media-preview.component';
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'media-gallery',
  templateUrl: './media-gallery.component.html',
  styleUrls: ['./media-gallery.component.scss']
})
export class MediaGalleryComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  @Input() galleryData!:AbstractControl | null;

  @Input() mediaData!:BehaviorSubject<MediaItem[]>;

  mediaPatientItems!:MediaItem[];

  galleryImages: Image[] = [];

  galleries!:Gallery[];

  constructor(
    public dialog: MatDialog,
    public datepipe: DatePipe,
    private patientService:PatientService
  ) { }


  ngOnInit(): void {
    this.initMedaiaGallery();

    this.mediaData?.subscribe(mediaItems => this.initMedaiaGalleryProperties(mediaItems));

  }

  openGalleryDialog($event: Event): void{

    $event.preventDefault();

    const dialogRef = this.dialog.open(MediaGalleryDialogComponent, {
        minWidth: '50vw',
        maxWidth: '100%',
        panelClass: 'media-gallery-dialog',
        data: {
            mediaGallery: this.galleries,
            mediaPatientItems: this.mediaData
        }
    });
  }

  openMediaDialog(): void{
      /* const dialogRef = this.dialog.open(MediaDialogComponent, {
          minWidth: '50%',
          data: {
              tagNumber: this.galleryData?.get('tagNumber')?.value,
              patientId: this.galleryData?.get('patientId')?.value,
          }
      }); */

      // TODO: Add the service to update the datetime in the image description by emmiting a behavior subject.
     /*  dialogRef.afterClosed()
      .pipe(takeUntil(this.ngUnsubscribe))
      // tslint:disable-next-line: deprecation
      .subscribe(updatedMedia => {

          if(updatedMedia){
              if(updatedMedia.isPrimary === true){

                  // this.profileUrl = updatedMedia.localURL || updatedMedia.remoteURL || this.profileUrl;
              }
          }
      }); */
    
      const dialogRef = this.dialog.open(MediaPreviewComponent, {
        minWidth: '75vw',
        panelClass: 'media-preview-dialog',
        data: {
          upload:true,
          patientId: this.galleryData?.get('patientId')?.value
        }
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  initMedaiaGallery(){

    if(this.mediaData)
    {
      // tslint:disable-next-line: deprecation
      this.mediaData.subscribe(mediaItems => {
        if(!mediaItems || mediaItems.length === 0)
        {
          return;
        }

        this.initMedaiaGalleryProperties(mediaItems);

      });
    }

  }

  updateMediaItems(){

    this.patientService.getPatientMediaItemsByPatientId(this.mediaData.value[0].patientId).pipe(
      takeUntil(this.ngUnsubscribe)
    // tslint:disable-next-line: deprecation
    ).subscribe((mediaItems:MediaItem[]) =>
      {
        if(mediaItems)
        {
          return;
        }
        this.initMedaiaGalleryProperties(mediaItems);
      }
    );

  }

  initMedaiaGalleryProperties(mediaItems:MediaItem[]) {
    if(!mediaItems){
        this.galleryImages.push({
          thumbnail:'../../../../../assets/images/image_placeholder.png',
          full:'../../../../../assets/images/image_placeholder.png',
          type: 'image',
        });

        return;
    }

    this.mediaPatientItems = mediaItems;

    this.galleryImages = this.mediaPatientItems.map(item=>{

        return {
            thumbnail:item.remoteURL,
            full:item.remoteURL,
            type: item.mediaType.includes('video') ? 'video' : 'image',
            time: this.datepipe.transform(item.datetime, 'HH:mm'),
            date: item.datetime.toString().replace('T',' ').slice(0,10),
            tags: item.tags,
            patientMediaItemId: item.patientMediaItemId,
            width: item.widthPX,
            height: item.heightPX
        };

    });

    this.galleries = Object.entries(this.galleryImages.reduce((r:any, a:any) => {
      r[a.date] = r[a.date] || [];
      r[a.date].push(a);
      return r;
      }, Object.create(null))).map(media => ({
        date:media[0],
        images:media[1] as Image[]
    }));

    return this.galleries;

  }
}
