import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { MediaItem } from '../models/media';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage'
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/auth/auth.service';
import { DatePipe } from '@angular/common';
import { PatientService } from 'src/app/modules/emergency-register/services/patient.service';

interface IResizeImageOptions {
  maxSize: number;
  file: File;
}

interface ResizedImage{
  image: Blob;
  width: number;
  height: number;
}

interface UploadPayload{
  task: AngularFireUploadTask;
  mediaItem: MediaItem;
}

@Injectable({
  providedIn: 'root'
})

export class MediaPasteService {

  constructor(private sanitizer: DomSanitizer,
    private storage: AngularFireStorage,
    private authService: AuthService,
    private datepipe: DatePipe,
    private patientService: PatientService,
    private fireAuth: AngularFireAuth) { }

    user: firebase.auth.UserCredential;


  handleUpload(file: File, patientId: number): Promise<MediaItem> {


    return new Promise<MediaItem>(async (resolve, reject) => {

      let newMediaItem:MediaItem = this.createMediaItem(file, patientId);

      return this.checkAuthenticated().then(async () => {

      //upload the file and return its progress for display

      let timeString = this.datepipe.transform(newMediaItem.datetime, "yyyyMMdd_hhmmss");

      newMediaItem.remoteURL = this.getFileUploadLocation(file.name, timeString);

              let options: IResizeImageOptions = {
                maxSize: 5000,
                file: file
              }

              return this.resizeImage(options).then(async (resizedImage:ResizedImage) => {

                console.log(resizedImage);

                newMediaItem.widthPX = resizedImage.width;
                newMediaItem.heightPX = resizedImage.height;

                return await this.uploadFile(newMediaItem, resizedImage.image).then(result => {
                  newMediaItem.mediaItemId = result.mediaItemId;

                  result.success === 1 ?
                  resolve(newMediaItem) :
                  reject();
                });

                // newMediaItem.uploadProgress = upload.task.snapshotChanges().pipe(map(s => (s.bytesTransferred / s.totalBytes) * 100));
                // newMediaItem = upload.mediaItem;
                // console.log("1");
                // console.log(upload.mediaItem);

              });

      }).catch(error => console.log(error));


    })




  }

  createMediaItem(file: File, patientId: number){

    let lastObjectUrl = URL.createObjectURL(file);

    let now = new Date();

    let isImage = this.isImageFile(file);

    let newMediaItem:MediaItem = {
      mediaItemId: null,
      mediaType: file.type,
      localURL: this.sanitizer.bypassSecurityTrustUrl(lastObjectUrl),
      remoteURL: null,
      datetime: now,
      comment: '',
      patientId: patientId,
      heightPX: 0,
      widthPX: 0,
      tags: [],
      uploadProgress: null,
      updated: false
    }

    if(isImage){

      const uploadImage = {
        url: lastObjectUrl,
        context: ''
      }

      //Get the dimensions of the image
      this.getImageDimension(uploadImage).subscribe((image) => {

        newMediaItem.widthPX = image.width;
        newMediaItem.heightPX = image.height;

      });

    }

    return newMediaItem;

  }

  getImageDimension(image): Observable<any> {

    return new Observable(observer => {
        const img = new Image();
        img.onload = function (event) {
            const loadedImage: any = event.currentTarget;
            image.width = loadedImage.width;
            image.height = loadedImage.height;
            observer.next(image);
            observer.complete();
        }
        img.src = image.url;
    });
}


  handlePaste(event: ClipboardEvent, patientId: number): MediaItem {

    const pastedImage:File = this.getPastedImage(event);

    if (!pastedImage) {
        return;
    }

    //Send the currentSize as the next mediaImageId so that it has its own ID.
    let newMediaItem:MediaItem = this.createMediaItem(pastedImage, patientId);

    return newMediaItem;

}

getPastedImage(event: ClipboardEvent): File | null {
    if (
        event.clipboardData &&
        event.clipboardData.files &&
        event.clipboardData.files.length &&
        this.isImageFile(event.clipboardData.files[0])
    ) {
        return event.clipboardData.files[0];
    }

    return null;
}

// Determine if the given File is an Image (according do its Mime-Type).
isImageFile(file: File): boolean {
    return file.type.search(/^image\//i) === 0;
}


async uploadFile(mediaItem: MediaItem, file:Blob) : Promise<any>
{
  // let uploadTask = this.storage.upload(mediaItem.remoteURL, file);

  return this.storage.upload(mediaItem.remoteURL, file).then(async result => {

    return result.ref.getDownloadURL().then(async url => {

      mediaItem.remoteURL = url;

            //Save the new image to the database and update the mediaItemId and its location etc
    // let dbSaveResult =

    return await this.patientService.savePatientMedia(mediaItem);

    // await dbSaveResult.then(result => {
    //   mediaItem.mediaItemId = result.mediaItemId;
    //   return mediaItem;

    // }).catch(error => console.log(error))

    });

  });
}

async checkAuthenticated(){

  if(!this.user){
    await this.fireAuth.signInWithEmailAndPassword(environment.firebase.email, environment.firebase.password).then( user => {
      this.user = user
    });
  }

}

getFileUploadLocation(filename: string, timestamp: string) : string{

  //Make sure we only save files in the folder for the organisation.
  let organisationFolder = this.authService.getOrganisationSocketEndPoint();

  return `${organisationFolder}/patient-media/${timestamp}_${filename}`;

}

async getRemoteURL(localURL: SafeUrl){

  let remoteURL;

  await this.checkAuthenticated();


  let localURLString = this.sanitizer.sanitize(SecurityContext.URL, localURL)

  this.storage.ref(localURLString).getDownloadURL().subscribe(url => {
    remoteURL = url;
  })


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
    for (var i = 0; i < max; i++) ia[i] = bytes.charCodeAt(i);
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
    canvas.getContext('2d').drawImage(image, 0, 0, width, height);
    let dataUrl = canvas.toDataURL('image/jpeg');

    let resizedImage:ResizedImage = {
        image: dataURItoBlob(dataUrl),
        width: width,
        height: height
    }

    return resizedImage;
  };

  return new Promise((ok, no) => {
      if (!file.type.match(/image.*/)) {
        no(new Error("Not an image"));
        return;
      }

      reader.onload = (readerEvent: any) => {
        image.onload = () => ok(resize());
        image.src = readerEvent.target.result;
      };
      reader.readAsDataURL(file);
  })
};



}
