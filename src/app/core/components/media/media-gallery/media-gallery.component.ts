import { Image, MediaItem,  Gallery, LocalMediaItem, LocalMedia} from 'src/app/core/models/media';
import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, Subject, timer } from 'rxjs';
import { delay, retryWhen, switchMap, takeUntil, tap } from 'rxjs/operators';
import { MediaGalleryDialogComponent } from '../media-gallery-dialog/media-gallery-dialog.component';
import { DatePipe } from '@angular/common';
import { PatientService } from 'src/app/core/services/patient/patient.service';
import { MediaPreviewComponent } from '../media-preview/media-preview.component';
import { OnlineStatusService } from 'src/app/core/services/online-status/online-status.service';
import { MediaPasteService } from 'src/app/core/services/navigation/media-paste/media-paste.service';
import { StorageService } from 'src/app/core/services/storage/storage.service';
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'media-gallery',
  templateUrl: './media-gallery.component.html',
  styleUrls: ['./media-gallery.component.scss']
})
export class MediaGalleryComponent implements OnInit, OnDestroy, AfterViewInit {

  private ngUnsubscribe = new Subject();

  private connectionStateSubs = new Subject();
  @Input() galleryData!:AbstractControl | null;

  @Input() mediaData!:BehaviorSubject<MediaItem[]>;

  mediaPatientItems!:MediaItem[];

  galleryImages: Image[] = [];

  galleries!:Gallery[];

  patientId!:number;

  checkConnection!:Observable<boolean>;

  constructor(
    public dialog: MatDialog,
    public datepipe: DatePipe,
    private patientService:PatientService,
    private onlineStatus: OnlineStatusService,
    private mediaPasteService: MediaPasteService,
    private storageService: StorageService

  ) { }


  ngOnInit(): void {

    this.patientId = this.galleryData?.get('patientId')?.value;
     
 
    this.checkConnection = timer(0,3000).pipe(
      takeUntil(this.connectionStateSubs),
      switchMap(() => this.onlineStatus.connectionChanged),
      takeUntil(this.ngUnsubscribe),
      retryWhen(errors =>
        errors.pipe(
          // log error message
          tap(error => console.log(error)),
          // restart after 5 seconds
          delay(5000)
        )
      )
    );

    this.checkConnection.subscribe(connectionState => {
      if(connectionState){

        if(this.mediaPasteService.imageExsistInLocalStorage(this.patientId)) {

          const localImages:LocalMedia[] = this.mediaPasteService.getPatientMediaImagesFromLocalStorage(this.patientId);

          localImages.forEach(localImage => {
            const mime = localImage.imageBase64.split(',')[0].split(':')[1].split(';')[0];
            const imageFile = new File([this.mediaPasteService.dataURItoBlob(localImage.imageBase64)], `${this.patientId},{22}`, { type: mime});
            this.mediaPasteService.handleUpload(imageFile,this.patientId, localImage.date as string);
          });
          
          this.mediaPasteService.deletePatientMediaByPatientId(this.patientId);
          
        }
        else{

          this.connectionStateSubs.next();
          this.connectionStateSubs.complete();
          
        }
      }
    });

    this.initMedaiaGallery();

    this.mediaData?.subscribe(mediaItems => this.initMedaiaGalleryProperties(mediaItems));

  }

  ngAfterViewInit() {
    this.onlineStatus.connectionChanged.subscribe((connectionStatus) => {

      if(!connectionStatus){
     
        if(this.mediaPasteService.imageExsistInLocalStorage(this.patientId)){

          setTimeout(() => {
            
            this.galleryImages = [];

            this.mediaPasteService.getPatientMediaImagesFromLocalStorage(this.patientId)
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

    // TODO: Add the service to update the datetime in the image description by emmiting a behavior subject.
     
    
    const dialogRef = this.dialog.open(MediaPreviewComponent, {

      minWidth: '75vw',
      panelClass: 'media-preview-dialog',
      data: {
        upload:true,
        patientId: this.galleryData?.get('patientId')?.value

      }

    });

    const sub = dialogRef.componentInstance.onArrowKey.pipe(takeUntil(this.ngUnsubscribe)).subscribe(key => {

      // tslint:disable-next-line: max-line-length
      const mediaDataIndex = this.mediaPatientItems.findIndex(mediaPatientItem => mediaPatientItem?.patientMediaItemId === dialogRef.componentInstance.data.mediaData?.patientMediaItemId);
      const imageIndex = this.galleryImages.findIndex(gal => gal.patientMediaItemId === dialogRef.componentInstance.data.mediaData?.patientMediaItemId);
      
    
       if(key === 37){
          if(imageIndex - 1 >= 0 && mediaDataIndex - 1 >= 0){
             
              const dialogData = {
                  image : this.galleryImages[imageIndex - 1],
                  mediaData :  dialogRef.componentInstance.data.mediaData = this.mediaPatientItems[mediaDataIndex - 1]
              };
              dialogRef.componentInstance.updateDialog(dialogData);
              
          }
      }
      
       if(key === 39){
          
          if(imageIndex + 1 <= this.galleryImages.length - 1 && mediaDataIndex + 1 <= this.mediaPatientItems.length - 1) {
             
              const dialogData = {
                  image : this.galleryImages[imageIndex + 1],
                  mediaData :  dialogRef.componentInstance.data.mediaData = this.mediaPatientItems[mediaDataIndex + 1]
              };
              dialogRef.componentInstance.updateDialog(dialogData);
          } 
      } 
      
    });
 

    dialogRef.afterClosed()
    .pipe(takeUntil(this.ngUnsubscribe))
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
}
