import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { map, takeUntil } from 'rxjs/operators';
import { Observable, from, BehaviorSubject, of, Subject} from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';
import { isImageFile, isVideoFile } from '../../helpers/utils';
import { UploadTaskSnapshot } from '@angular/fire/compat/storage/interfaces';
import { OnlineStatusService } from '../online-status/online-status.service';
import { StorageService } from '../storage/storage.service';
import { OrganisationOptionsService } from '../organisation-option/organisation-option.service';
import { Comment, MediaItemReturnObject, MediaItem, LocalMediaItem, MediaItemsDataObject, MediaResponse, MediaUploadResponse } from '../../models/media';
import { PatientOutcomeResponse } from '../../models/patients';
import { HttpClient } from '@angular/common/http';
import { APIService } from '../http/api.service';

interface IResizeImageOptions {
  maxSize: number;
  file: File;
}

interface ResizedImage{
  image: Blob;
  width: number;
  height: number;
  dataUrl: string;
}


@Injectable({
  providedIn: 'root'
})

export class MediaService extends APIService {

  endpoint = 'Media';

  private ngUnsubscribe = new Subject();

  mediaItemData : MediaItemsDataObject[] = [];
  mediaItemId$!: BehaviorSubject<number>;
  mediaItemObject! : MediaItem;

  returnMediaItem : BehaviorSubject<MediaItem[]> = new BehaviorSubject<MediaItem[]>([]);

  user!: firebase.default.auth.UserCredential;

  constructor(
    private sanitizer: DomSanitizer,
    private storage: AngularFireStorage,
    private datepipe: DatePipe,
    private fireAuth: AngularFireAuth,
    private onlineStatus: OnlineStatusService,
    private snackbarService:SnackbarService,
    http: HttpClient,
    public datePipe:DatePipe,
    protected storageService: StorageService,
    private organisationOptions: OrganisationOptionsService) {  super(http); }

  handleUpload(file: File, Id: number, offlineUploadDate?:string, filePath?:string): MediaItemReturnObject {

    if(!file.type.match(/image.*|video.*/)){
      return {
        mediaItem: undefined,
        mediaItemId: new BehaviorSubject<number | undefined>(undefined),
        result: 'nonmedia'
      };
    }

    const newMediaItem:MediaItem = this.createMediaItem(file, Id);

    const returnObject:MediaItemReturnObject = {
        mediaItem: newMediaItem,
        mediaItemId: new BehaviorSubject<number | undefined>(undefined),
        result: 'success'
    };
    if(offlineUploadDate){

      newMediaItem.datetime = offlineUploadDate;

    }


      this.checkAuthenticated().then(async () => {

        // upload the file and return its progress for display

        const timeString = this.datepipe.transform(newMediaItem.datetime, 'yyyyMMdd_hhmmss');

        const path = filePath ? filePath : 'patient-media';

        const uploadLocation = this.getFileUploadLocation(file.name, timeString || '', path);


        if(newMediaItem.mediaType.indexOf('image') > -1){

          const resizedImage = await this.croppedImage(file);

          if(!this.duplicateImage(file.name, Id) || file.name ==='uploadFile'){

            newMediaItem.widthPX = resizedImage.width;
            newMediaItem.heightPX = resizedImage.height;

            const uploadResult = this.uploadFile(uploadLocation, resizedImage.image);

            newMediaItem.uploadProgress$ = this.getUploadProgress(uploadResult);

            // TODO Fix the height and width of video so it doesn't overflow the containing div in the template

            uploadResult.then((result: any) => {

              result.ref.getDownloadURL().then((url:any) => {

                newMediaItem.remoteURL = url;

                newMediaItem.datetime = this.datePipe.transform(new Date(),'yyyy-MM-ddThh:mm') as string;


                path === 'patient-media'?


                  this.savePatientMedia(newMediaItem).then((mediaItems:any) => {

                    this.onlineStatus.updateOnlineStatusAfterSuccessfulHTTPRequest();

                    if(mediaItems.success) {

                      returnObject.mediaItemId.next(mediaItems.mediaItemId);

                    }

                  })

                :

                returnObject.mediaItemId.next(0);

              });

            }).catch(async (error: any) => {
              console.log(error);
            });
          }
          else{

            this.snackbarService.errorSnackBar('Duplicate Image upload are not allowed', 'OK');

          }
        }
        else{

          const uploadResult = this.uploadFile(uploadLocation, file);

          newMediaItem.uploadProgress$ = this.getUploadProgress(uploadResult);


          // TODO Fix the height and width of video so it doesn't overflow the containing div in the template

          uploadResult.then((result:any) => {

            result.ref.getDownloadURL().then((url:any) => {

              newMediaItem.remoteURL = url;

              const savetoDB : Observable<any> = from(this.savePatientMedia(newMediaItem));

              newMediaItem.mediaItemId = savetoDB.pipe(map(response => response.mediaItemId));

              newMediaItem.mediaItemId.pipe(takeUntil(this.ngUnsubscribe)).subscribe(id => {

                returnObject.mediaItemId.next(id);

              });

            });

          });

        }


      }).catch(async error => {

      /**
       * Offline Mode
       */

      if(!this.onlineStatus.connectionChanged.value){

        this.snackbarService.errorSnackBar('Case saved to local storage', 'OK');

        const resizedImage = await this.croppedImage(file);
        this.onlineStatus.updateOnlineStatusAfterUnsuccessfulHTTPRequest();

        /**
         * Patient already exist in local storage
         * add more images to patient
         */

        if(this.imageExsistInLocalStorage(Id))
        {

          let localMediaItems:LocalMediaItem[] = this.storageService.getItemArray('MEDIA').map(mediaItem =>
            JSON.parse(JSON.parse(mediaItem.value as string))[0]
          );


          localMediaItems = localMediaItems.map((mediaItem:LocalMediaItem) => {
            if(mediaItem.patientId === Id){


              mediaItem.media.push({date:  this.datePipe.transform(new Date(),'yyyy-MM-ddThh:mm'), imageBase64:resizedImage.dataUrl});
            }
            return mediaItem;
          });

          this.saveToLocalDatabase('MEDIA', JSON.stringify(localMediaItems));


        }
        else{
          /**
           * New patient entry
           */

          /**
           * Local Storage media object exists
           * fetch previous media storage and push new patient entry
           * convert to string for storage
           */

          if(this.storageService.getItemArray('MEDIA').length >= 0){

            const localMedia = this.getParseMediaObject();

            localMedia.push({headerType:'POST',patientId: Id, media:[{date: this.datePipe.transform(new Date(),'yyyy-MM-ddThh:mm'), imageBase64:resizedImage.dataUrl}]});

            this.saveToLocalDatabase(
              'MEDIA', JSON.stringify(localMedia)
            );

          }

          this.onlineStatus.connectionChanged.next(false);
        }

        (returnObject.mediaItem as MediaItem).uploadProgress$ = of(100);

        returnObject.mediaItemId.next(1);

      }
      else {

        return error;

      }

    });

    return returnObject;

  }



  handleImageUpload(file: File){

    const returnObject = {
      url: new BehaviorSubject<string | undefined>(undefined),
      uploaded: new BehaviorSubject<boolean | undefined>(undefined)
    };

    if(!file.type.match(/image.*|video.*/)){
      return;
    }
    this.checkAuthenticated().then(async () => {

      const timeString = this.datepipe.transform(new Date(), 'yyyyMMdd_hhmmss');
      const uploadLocation = this.getFileUploadLocation(file.name, timeString || '','vehicles');
      if(file.type.match(/image.*/)){
        const resizedImage = await this.croppedImage(file);
        const uploadResult = this.uploadFile(uploadLocation, resizedImage.image);
        uploadResult.then((result: any) => {

          result.ref.getDownloadURL().then((url:any) => {

            returnObject.url.next(url);

        });});
      }
    });

    return returnObject;
  }
  private async croppedImage(file: File) {
    const options: IResizeImageOptions = {
      maxSize: 5000,
      file
    };

    return await this.resizeImage(options);

  }

  duplicateImage(filename:string,patientId:number){
   let duplicate = false;
   this.getPatientMediaItemsByPatientId(patientId)?.value.forEach(async mediaItem => duplicate = mediaItem.remoteURL.includes(filename));
   return duplicate;
  }

  private async saveToLocalDatabase(key:any, body:any) {
    // Make a unique identified so we don't overwrite anything in local storage.

    try {
        this.storageService.save(key , body);
        return Promise.resolve({
            status: 'saved',
            message: 'Record successfully saved to offline storage.',
        });
    } catch (error) {
        return Promise.reject({
            status: 'error',
            message: 'An error occured saving to offline storage: ' + error,
        });
    }
  }

  getUploadProgress(uploadResult:AngularFireUploadTask) : Observable<number>{

    return uploadResult.snapshotChanges().pipe(map((snapshot:UploadTaskSnapshot|undefined) =>{

      return snapshot ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100 : 0;

    }));

  }

  createMediaItem(file: File, patientId: number){

    const lastObjectUrl = URL.createObjectURL(file);

    const now = new Date();

    const isImage = isImageFile(file);
    const isVideo = isVideoFile(file);

    const newMediaItem:MediaItem = {
      mediaItemId: new Observable<number>(),
      patientMediaItemId: 0,
      organisationMediaItemId: 0,
      mediaType: file.type,
      localURL: this.sanitizer.bypassSecurityTrustUrl(lastObjectUrl),
      isPrimary: false,
      remoteURL: '',
      datetime: now,
      patientId,
      heightPX: 0,
      widthPX: 0,
      tags: [],
      uploadProgress$: null,
      updated: false,
      deleted: false
    };

    const uploadImage = {
      url: lastObjectUrl,
      context: '',
      height: 0,
      width: 0
    };

    if(isImage || isVideo){

      const mediaObservable = isImage ? this.getImageDimension(uploadImage) :
      this.getVideoDimension(uploadImage);

      // Get the dimensions of the image
      mediaObservable.pipe(takeUntil(this.ngUnsubscribe)).subscribe((image) => {

        newMediaItem.widthPX = image.width;
        newMediaItem.heightPX = image.height;

      });

    }

    return newMediaItem;

  }


  getImageDimension(image:any): Observable<any> {

    return new Observable(observer => {
        const img = new Image();
        img.onload = (event) => {
            const loadedImage: any = event.currentTarget;
            image.width = loadedImage.width;
            image.height = loadedImage.height;
            observer.next(image);
            observer.complete();
        };
        img.src = image.url;
    });
  }

  getVideoDimension(video:any): Observable<any> {

    return new Observable(observer => {
        const vid = document.createElement('video');

        vid.onload = (event) => {
            const loadedVideo: any = event.currentTarget;
            video.width = loadedVideo.width;
            video.height = loadedVideo.height;
            observer.next(video);
            observer.complete();
        };

        vid.src = video.url;
        vid.load();
    });
  }


  handlePaste(event: ClipboardEvent, patientId: number, base64:string): MediaItem {

    const pastedImage:File|undefined = this.getPastedImage(event);

    if (!pastedImage) {
        return {} as MediaItem;
    }

    // Send the currentSize as the next mediaImageId so that it has its own ID.
    const newMediaItem:MediaItem = this.createMediaItem(pastedImage, patientId);

    return newMediaItem;

  }

  getPastedImage(event: ClipboardEvent): File | undefined {

    if (
        event.clipboardData &&
        event.clipboardData.files &&
        event.clipboardData.files.length &&
        isImageFile(event.clipboardData.files[0])
    ) {
        return event.clipboardData.files[0];
    }

    return undefined;
  }

  uploadFile(url:string, file:Blob) : AngularFireUploadTask
  {

    if(!url){
      throw new Error ('No image URL provided');
    }

    return this.storage.upload(url, file);

  }

  async checkAuthenticated(){

    if(!this.user){
      await this.fireAuth.signInWithEmailAndPassword(environment.firebase.email, environment.firebase.password).then( (user : any) => {
        this.user = user;
      }).catch((error: any) => {
        console.log(error);
      });
    }

  }

  getFileUploadLocation(filename: string, timestamp: string, folder:string) : string{

    // Make sure we only save files in the folder for the organisation.
    const organisationFolder = this.organisationOptions.getOrganisationSocketEndPoint();

    return `${organisationFolder}/${folder}/${timestamp}_${filename}`;

  }

  async getRemoteURL(localURL: SafeUrl){

    let remoteURL;

    await this.checkAuthenticated();

    const localURLString = this.sanitizer.sanitize(SecurityContext.URL, localURL);

    if(!localURLString){
      throw new Error('No local URL provided');
    }

    this.storage.ref(localURLString).getDownloadURL().pipe(takeUntil(this.ngUnsubscribe)).subscribe((url: any) => {
      remoteURL = url;
    });

    return remoteURL;

  }

  dataURItoBlob = (dataURI: string) => {

    const bytes = dataURI.split(',')[0].indexOf('base64') >= 0 ?
        atob(dataURI.split(',')[1]) :
        unescape(dataURI.split(',')[1]);
    const mime = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const max = bytes.length;
    const ia = new Uint8Array(max);
    for (let i = 0; i < max; i++) { ia[i] = bytes.charCodeAt(i); }
    return new Blob([ia], {type:mime});
  }

  resizeImage(settings: IResizeImageOptions) : Promise<ResizedImage>  {
    const file = settings.file;
    const maxSize = settings.maxSize;
    const reader = new FileReader();
    const image = new Image();
    const canvas = document.createElement('canvas');


    const resize = () => {
      let width = image.width;
      let height = image.height;

      if (width > height) {
          if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
          }
      } else {
          if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
          }
      }

      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')?.drawImage(image, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg');

      const resizedImage:ResizedImage = {
          image: this.dataURItoBlob(dataUrl),
          width,
          height,
          dataUrl
      };
      return resizedImage;
    };

    return new Promise<ResizedImage>((resolve, reject) => {

        if (!file.type.match(/image.*|video.*/)) {
          reject(new Error('Not an image or video'));
          return;
        }

        reader.onload = (readerEvent: any) => {
          image.onload = () => resolve(resize());
          image.src = readerEvent.target.result;
        };

        reader.readAsDataURL(file);
    });
  }




  getParseMediaObject() {
    if(this.storageService.getItemArray('MEDIA')[0]){
      return JSON.parse(JSON.parse(this.storageService.getItemArray('MEDIA')[0].value as string)) as LocalMediaItem[];
    }else {
      return [];
    }

  }

  getMediaItemsFromLocalStoargeByPatientId(patientId:number){
    return this.getParseMediaObject().filter((mediaItem:LocalMediaItem) => mediaItem.patientId === patientId)[0];
  }

  imageExsistInLocalStorage(patientId:number){

    return this.getMediaItemsFromLocalStoargeByPatientId(patientId)  ? true : false;

  }

  getPatientMediaImagesFromLocalStorage(patientId:number){

    return this.getMediaItemsFromLocalStoargeByPatientId(patientId).media;

  }


  deletePatientMediaByPatientId(patientId:number){

    const index = this.getParseMediaObject().findIndex((media:any) => media.patientId === patientId);
    const mediaArray = this.getParseMediaObject();

    mediaArray.splice(index,1);

    this.saveToLocalDatabase('MEDIA',JSON.stringify(mediaArray));

  }

  public async savePatientMedia(mediaItem: MediaItem) : Promise<void | MediaUploadResponse>{

    return await this.put(mediaItem)
        .then((data: MediaUploadResponse) => {

            if(data.success === 1){

                //Let's see if this item already exists
                let patientMediaItem = this.mediaItemData.find(patientMediaItemVal =>
                    patientMediaItemVal.patientId === mediaItem.patientId
                );

                if(!patientMediaItem){

                    // We're loading the service for the first time and the first patient has no photos
                    patientMediaItem = {
                        patientId: mediaItem.patientId,
                        mediaItem : new BehaviorSubject<MediaItem[]>([mediaItem])
                    };

                    this.mediaItemData.push(patientMediaItem);

                }

                //If this is primary, then ensure all the other images aren't the primary.
                //The update for the rest in the database is handled in sp_UpdatePatientMedia
                if(mediaItem.isPrimary){

                  this.mediaItemData.forEach(currentMediaItem => {

                    if(currentMediaItem.patientId === mediaItem.patientId){

                      currentMediaItem.mediaItem.getValue().forEach(currentMediaItemVal => {

                        if(currentMediaItemVal.mediaItemId !== mediaItem.mediaItemId){

                          currentMediaItemVal.isPrimary = false;

                        }

                      })
                    }

                  });

                }

                //Get the media list for the current patient from the bahvior subject.
                let currentPatientMediaList = patientMediaItem?.mediaItem.getValue();

                //Check if we're being deleted
                if(mediaItem.deleted){
                    currentPatientMediaList = currentPatientMediaList?.filter(e => e.patientMediaItemId !== data.mediaItemId);
                }

                //Check if the incoming item already exists
                const existingItem = currentPatientMediaList?.findIndex(item => item.patientMediaItemId === data.mediaItemId);

                //If it doesn't exist add it in.
                if(existingItem === -1 ){
                    currentPatientMediaList?.push(mediaItem);
                }
                 else if(existingItem > -1 && currentPatientMediaList){
                        currentPatientMediaList[existingItem] = mediaItem;
                }

                //If the current image/video is the primary, then reset all of the others.
                if(mediaItem.isPrimary){
                  currentPatientMediaList.forEach(mediaElement => {

                    if(mediaElement.mediaItemId != mediaItem.mediaItemId){
                      mediaElement.isPrimary = false;
                    }

                  });
                }



                if(currentPatientMediaList){
                    patientMediaItem?.mediaItem.next(currentPatientMediaList);
                }

            }

            return data;
        })
        .catch((error:any) => {
            console.log(error);
        });

}

public getPatientMediaItemsByPatientId(patientId: number): BehaviorSubject<MediaItem[]> {

    const request = '/PatientMediaItems?patientId=' + patientId;

    let patientMediaItem = this.mediaItemData.find(patientMediaItemVal =>
        patientMediaItemVal.patientId === patientId
    );

    const returnBehaviorSubject: BehaviorSubject<MediaItem[]> =
    patientMediaItem ? patientMediaItem.mediaItem : new BehaviorSubject<MediaItem[]>([]);

    if(!patientMediaItem){
        patientMediaItem = this.addEmptyPatientMediaBehaviorSubject(returnBehaviorSubject, patientId);
    }

    // tslint:disable-next-line: deprecation
    this.getObservable(request).pipe(
        map(mediaItems => mediaItems?.sort((a:any, b:any) => new Date(b?.datetime).getTime() - new Date(a?.datetime).getTime()))
    ).pipe(takeUntil(this.ngUnsubscribe)).subscribe((media : MediaResponse[])=>{

        if(!media){
            return;
        }

        const savedMediaItems: MediaItem[] = media.map(item=>{

            return {
                mediaItemId : of(item.mediaItemId),
                patientMediaItemId: item.mediaItemId,
                mediaType: item.mediaType,
                localURL: item.localURL,
                remoteURL: item.remoteURL,
                isPrimary :item.isPrimary ? true : false,
                datetime: item.datetime,
                patientId: item.patientId,
                heightPX: item.heightPX,
                widthPX: item.widthPX,
                tags: item.tags,
                uploadProgress$: of(100),
                updated: false,
                deleted: false
            };

        });

        if(patientMediaItem){
            patientMediaItem.mediaItem.next(savedMediaItems);
        }

    });

    return returnBehaviorSubject;
}

addEmptyPatientMediaBehaviorSubject(returnBehaviorSubject:BehaviorSubject<MediaItem[]>, patientId:number) : MediaItemsDataObject {

    const newItemData : MediaItemsDataObject = {
        patientId,
        mediaItem : returnBehaviorSubject
    };
    returnBehaviorSubject.next([]);

    this.mediaItemData.push(newItemData);

    return newItemData;

}

public async savePatientMediaComment(comment: any) : Promise<PatientOutcomeResponse> {
    return await this.post(comment)
    .catch(error => {
        console.log(error);
    });

}

public getPatientMediaComments(patientMediaItemId: number): Observable<Comment[]> {

    const request = '/PatientMediaComments?patientMediaItemId=' + patientMediaItemId;

    return this.getObservable(request).pipe(
        map(response => {
            return  response?.sort((comment1: Comment,comment2:Comment)=> {
                return new Date(comment2.timestamp).valueOf() - new Date(comment1.timestamp).valueOf();
            });

        })
    );
}

//Let's get the media items for the current patient and return an observable of unique dates.
public getGalleryDatesForPatientId(patientId: number): Observable<string[]> {

    let currentPatient = this.mediaItemData.find(element => element.patientId = patientId);

    let dateArray = currentPatient?.mediaItem.pipe(map(mediaItems =>

      mediaItems.map(mediaItem => this.datePipe.transform(mediaItem.datetime, 'yyyy-MM-dd'))
                .reduce<(string)[]>((acc, curr) => {

        console.log(curr);

        curr = curr || "1901-01-01";

        if(!acc.includes(curr)){
            acc.push(curr);
        }

        return acc;

    }, [])));


    return currentPatient && dateArray ? dateArray : of([""]);



}

}