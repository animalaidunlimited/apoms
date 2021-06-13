import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { LocalMediaItem, MediaItem, MediaItemReturnObject } from '../../../models/media';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { map } from 'rxjs/operators';
import { Observable, from, BehaviorSubject, Observer} from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/auth/auth.service';
import { DatePipe } from '@angular/common';
import { PatientService } from 'src/app/core/services/patient/patient.service';
import { isImageFile, isVideoFile } from '../../../helpers/utils';
import { UploadTaskSnapshot } from '@angular/fire/storage/interfaces';
import { OnlineStatusService } from '../../online-status/online-status.service';
import { StorageService } from '../../storage/storage.service';
import { HttpClient } from '@angular/common/http';
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

export class MediaPasteService {

  constructor(
    private sanitizer: DomSanitizer,
    private storage: AngularFireStorage,
    private authService: AuthService,
    private datepipe: DatePipe,
    private patientService: PatientService,
    private fireAuth: AngularFireAuth,
    private onlineStatus: OnlineStatusService,
    private snackbarService:SnackbarService,
    protected storageService: StorageService,
    private httpClient:HttpClient) { }

    user!: firebase.auth.UserCredential;
    mediaItemId$!: BehaviorSubject<number>;


    


  handleUpload(file: File, patientId: number): MediaItemReturnObject {

    if(!file.type.match(/image.*|video.*/)){
      return {
        mediaItem: undefined,
        mediaItemId: new BehaviorSubject<number | undefined>(undefined),
        result: 'nonmedia'
      };
    }

    const newMediaItem:MediaItem = this.createMediaItem(file, patientId);

    const returnObject:MediaItemReturnObject = {
        mediaItem: newMediaItem,
        mediaItemId: new BehaviorSubject<number | undefined>(undefined),
        result: 'success'
    };


    this.checkAuthenticated().then(async () => {

      // upload the file and return its progress for display

      const timeString = this.datepipe.transform(newMediaItem.datetime, 'yyyyMMdd_hhmmss');

      const uploadLocation = this.getFileUploadLocation(file.name, timeString || '');

      const options: IResizeImageOptions = {
        maxSize: 5000,
        file
      };
      
     
      if(newMediaItem.mediaType.indexOf('image') > -1){

        const resizedImage = await this.resizeImage(options);

        if(!this.duplicateImage(file.name, patientId)){

       
       
          newMediaItem.widthPX = resizedImage.width;
          newMediaItem.heightPX = resizedImage.height;
      
          const uploadResult = this.uploadFile(uploadLocation, resizedImage.image);

          newMediaItem.uploadProgress$ = this.getUploadProgress(uploadResult);

          console.log(this.getUploadProgress(uploadResult));

          // TODO Fix the height and width of video so it doesn't overflow the containing div in the template

          uploadResult.then((result) => {

            result.ref.getDownloadURL().then((url:any) => {

              newMediaItem.remoteURL = url;

              this.patientService.savePatientMedia(newMediaItem).then((mediaItems:any) => {
                
                this.onlineStatus.updateOnlineStatusAfterSuccessfulHTTPRequest();

                if(mediaItems.success) {
                  returnObject.mediaItemId.next(mediaItems.mediaItemId);
                }
                
              });

            });

          }).catch(async error => {
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

        uploadResult.then((result) => {

          result.ref.getDownloadURL().then((url:any) => {

            newMediaItem.remoteURL = url;

            const savetoDB : Observable<any> = from(this.patientService.savePatientMedia(newMediaItem));

            newMediaItem.mediaItemId = savetoDB.pipe(map(response => response.mediaItemId));

            newMediaItem.mediaItemId.subscribe(id => {
              returnObject.mediaItemId.next(id);

            });

          });

        });

      }


    }).catch(async error => {
        if(!this.onlineStatus.connectionChanged.value){

          this.snackbarService.errorSnackBar('Case saved to local storage', 'OK');

          this.onlineStatus.updateOnlineStatusAfterUnsuccessfulHTTPRequest();
          
          const reader = new FileReader();
          reader.readAsDataURL(file);
          
          reader.onload = () => { 
            
            this.saveToLocalDatabase(
              'MEDIA', JSON.stringify({headerType:'POST',patientId, media:reader.result})
            );
          };
        
        }
        else{

          return console.log(error);

        }
    });

    return returnObject;

  }

  duplicateImage(filename:string,patientId:number){
   let duplicate = false;
   this.patientService.getPatientMediaItemsByPatientId(patientId)?.value.forEach(async mediaItem => duplicate = mediaItem.remoteURL.includes(filename));
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
      mediaObservable.subscribe((image) => {

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
      await this.fireAuth.signInWithEmailAndPassword(environment.firebase.email, environment.firebase.password).then( user => {
        this.user = user;
      });
    }

  }

  getFileUploadLocation(filename: string, timestamp: string) : string{

    // Make sure we only save files in the folder for the organisation.
    const organisationFolder = this.authService.getOrganisationSocketEndPoint();

    return `${organisationFolder}/patient-media/${timestamp}_${filename}`;

  }

  async getRemoteURL(localURL: SafeUrl){

    let remoteURL;

    await this.checkAuthenticated();

    const localURLString = this.sanitizer.sanitize(SecurityContext.URL, localURL);

    if(!localURLString){
      throw new Error('No local URL provided');
    }

    this.storage.ref(localURLString).getDownloadURL().subscribe(url => {
      remoteURL = url;
    });

    return remoteURL;

  }


  resizeImage(settings: IResizeImageOptions) : Promise<ResizedImage>  {
    const file = settings.file;
    const maxSize = settings.maxSize;
    const reader = new FileReader();
    const image = new Image();
    const canvas = document.createElement('canvas');

    const dataURItoBlob = (dataURI: string) => {
      const bytes = dataURI.split(',')[0].indexOf('base64') >= 0 ?
          atob(dataURI.split(',')[1]) :
          unescape(dataURI.split(',')[1]);
      const mime = dataURI.split(',')[0].split(':')[1].split(';')[0];
      const max = bytes.length;
      const ia = new Uint8Array(max);
      for (let i = 0; i < max; i++) { ia[i] = bytes.charCodeAt(i); }
      return new Blob([ia], {type:mime});
    };

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
          image: dataURItoBlob(dataUrl),
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


  imageExsistInLocalStorage(patientId:number){
    this.onlineStatus.connectionChanged.subscribe(async online=>{
      if(online){
        const localMediaItems:LocalMediaItem[] = this.storageService.getItemArray('MEDIA').map(mediaItem => 
          JSON.parse(JSON.parse(mediaItem.value as string))
        ).filter((mediaItem:LocalMediaItem) => mediaItem.patientId === patientId);

        // console.log(localMediaItems[0].media.split(',')[0].split(';')[0].split(':')[1]);
      }
    });
  }

}
