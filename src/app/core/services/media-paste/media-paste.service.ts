import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MediaItem, MediaItemReturnObject } from '../../models/media';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { map } from 'rxjs/operators';
import { Observable, from, BehaviorSubject, of } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/auth/auth.service';
import { DatePipe } from '@angular/common';
import { PatientService } from 'src/app/modules/emergency-register/services/patient.service';
import { isImageFile, isVideoFile } from '../../helpers/utils';

interface IResizeImageOptions {
  maxSize: number;
  file: File;
}

interface ResizedImage{
  image: Blob;
  width: number;
  height: number;
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
    private fireAuth: AngularFireAuth) { }

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

      newMediaItem.remoteURL = this.getFileUploadLocation(file.name, timeString || '');

              const options: IResizeImageOptions = {
                maxSize: 5000,
                file
              };

              if(newMediaItem.mediaType === 'image'){

                this.resizeImage(options).then(async (resizedImageIncoming:unknown) => {

                  const resizedImage = JSON.parse(JSON.stringify(resizedImageIncoming)) as ResizedImage;

                  newMediaItem.widthPX = resizedImage.width;
                  newMediaItem.heightPX = resizedImage.height;

                  const uploadResult = this.uploadFile(newMediaItem, resizedImage.image);

                  // TODO - Type s properly
                  newMediaItem.uploadProgress$ = uploadResult.snapshotChanges().pipe(map((s:any) => (s.bytesTransferred / s.totalBytes) * 100));

                  uploadResult.then((result) => {

                    result.ref.getDownloadURL().then(url => {

                      newMediaItem.remoteURL = url;

                      newMediaItem.mediaItemId.subscribe(id => {
                        returnObject.mediaItemId.next(id);

                      });

                    });

                  });

                  });
              }
              else{

                const uploadResult = this.uploadFile(newMediaItem, file);

                // TODO - Type s properly
                newMediaItem.uploadProgress$ = uploadResult.snapshotChanges().pipe(map((s:any) => (s.bytesTransferred / s.totalBytes) * 100));

                // TODO Fix the height and width of video so it doesn't overflow the containing div in the template

                uploadResult.then((result) => {

                  result.ref.getDownloadURL().then(url => {

                    newMediaItem.remoteURL = url;

                    const savetoDB : Observable<any> = from(this.patientService.savePatientMedia(newMediaItem));

                    newMediaItem.mediaItemId = savetoDB.pipe(map(response => response.mediaItemId));

                    newMediaItem.mediaItemId.subscribe(id => {
                      returnObject.mediaItemId.next(id);

                    });

                  });

                });

              }



      }).catch(error => console.log(error));

return returnObject;

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
      comment: '',
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


  handlePaste(event: ClipboardEvent, patientId: number): MediaItem {

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

uploadFile(mediaItem: MediaItem, file:Blob) : AngularFireUploadTask
{

  if(!mediaItem.remoteURL){
    throw new Error ('No image URL provided');
  }

  return this.storage.upload(mediaItem.remoteURL, file);

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


resizeImage(settings: IResizeImageOptions) {
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
        height
    };

    return resizedImage;
  };

  return new Promise((ok, no) => {

      if (!file.type.match(/image.*|video.*/)) {
        no(new Error('Not an image or video'));
        return;
      }

      reader.onload = (readerEvent: any) => {
        image.onload = () => ok(resize());
        image.src = readerEvent.target.result;
      };
      reader.readAsDataURL(file);
  });
}



}
