import { Image, MediaItem,  Gallery, LocalMedia} from 'src/app/core/models/media';
import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MediaGalleryDialogComponent } from '../media-gallery-dialog/media-gallery-dialog.component';
import { DatePipe } from '@angular/common';
import { MediaService } from 'src/app/core/services/media/media.service';
import { MediaPreviewComponent } from '../media-preview/media-preview.component';
import { OnlineStatusService } from 'src/app/core/services/online-status/online-status.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'media-gallery',
  templateUrl: './media-gallery.component.html',
  styleUrls: ['./media-gallery.component.scss']
})
export class MediaGalleryComponent implements OnInit, OnDestroy, AfterViewInit {

  private ngUnsubscribe = new Subject();

  @Input() patientData!:AbstractControl | null;

  @Input() displayImagesAndButtons!:boolean;

  public get patientId() {
		return this.patientData?.get('patientId')?.value;
	}

  constructor(
    public dialog: MatDialog,
    public datepipe: DatePipe,
    private mediaService: MediaService,
    private onlineStatus: OnlineStatusService,
    private MediaService: MediaService
  ) { }


  ngOnInit(): void {

    this.onlineStatus.connectionChanged.pipe(takeUntil(this.ngUnsubscribe)).subscribe(connectionState => {

      if(connectionState){

        if(this.MediaService.imageExistsInLocalStorage(this.patientId)) {

          const localImages:LocalMedia[] = this.MediaService.getPatientMediaImagesFromLocalStorage(this.patientId);

          localImages.forEach(localImage => {
            const mime = localImage.imageBase64.split(',')[0].split(':')[1].split(';')[0];
            const imageFile = new File([this.MediaService.dataURItoBlob(localImage.imageBase64)], `${this.patientId},{22}`, { type: mime});
            this.MediaService.handleUpload(imageFile,this.patientId, localImage.date as string);
          });

          this.MediaService.deletePatientMediaByPatientId(this.patientId);
        }
      }
    });

   // this.initMedaiaGallery();

   // this.mediaData?.pipe(takeUntil(this.ngUnsubscribe)).subscribe(mediaItems => this.initMedaiaGalleryProperties(mediaItems));

  }

  ngAfterViewInit() {

    /*
    this.onlineStatus.connectionChanged.pipe(takeUntil(this.ngUnsubscribe)).subscribe((connectionStatus) => {

      if(!connectionStatus){

        if(this.MediaService.imageExistsInLocalStorage(this.patientId)){

          setTimeout(() => {

            this.galleryImages = [];

            this.MediaService.getPatientMediaImagesFromLocalStorage(this.patientId)
            .forEach((patientImage)=> {

              this.galleryImages.push({
                thumbnail:patientImage.imageBase64,
                full:patientImage.imageBase64,
                type: 'image',
                time: this.datepipe.transform(patientImage.date, 'HH:mm'),
                date: patientImage.date?.toString().replace('T',' ').slice(0,10),
              });

            });

          });
        }
      }

    });
  */
  }

  openGalleryDialog($event: Event): void{

    $event.preventDefault();

    const dialogRef = this.dialog.open(MediaGalleryDialogComponent, {
        minWidth: '50vw',
        maxWidth: '100%',
        panelClass: 'media-gallery-dialog',
        data: {
          patientId: this.patientId
        }
    });

  }

  openMediaDialog(): void{

    const dialogRef = this.dialog.open(MediaPreviewComponent, {
      minWidth: '75vw',
      panelClass: 'media-preview-dialog',
      data: {
        upload: true,
        patientId: this.patientId
      }

    });

  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  /*
  initMedaiaGallery(){

    if(this.mediaData)
    {
      // tslint:disable-next-line: deprecation
      this.mediaData.pipe(takeUntil(this.ngUnsubscribe)).subscribe(mediaItems => {
        if(!mediaItems || mediaItems.length === 0)
        {
          return;
        }

        this.initMedaiaGalleryProperties(mediaItems);

      });
    }

  }

  updateMediaItems(){

    this.mediaService.getPatientMediaItemsByPatientId(this.mediaData.value[0].patientId).pipe(
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
            date: this.datepipe.transform( new Date(item.datetime) , 'yyyy-MM-dd'),
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
  */
}
