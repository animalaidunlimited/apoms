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
import {NgxImageCompressService} from 'ngx-image-compress';

@Injectable({
  providedIn: 'root'
})
export class MediaPasteService {

  constructor(private sanitizer: DomSanitizer,
    private storage: AngularFireStorage,
    private authService: AuthService,
    private datepipe: DatePipe,
    private patientService: PatientService,
    private imageCompress: NgxImageCompressService,
    private fireAuth: AngularFireAuth) { }

    user: firebase.auth.UserCredential;


  handleUpload(file: File, patientId: number): MediaItem {

    let newMediaItem = this.createMediaItem(file, patientId);

    this.checkAuthenticated().then(() => {

    //upload the file and return its progress for display

      newMediaItem.uploadProgress = this.uploadFile(file, newMediaItem);
      console.log(newMediaItem.uploadProgress);

    }).catch(error =>

      console.log(error));



    return newMediaItem;

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
            console.log(image);
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

uploadFile(file: File, mediaItem: MediaItem) : Observable<number>{

  let timeString = this.datepipe.transform(mediaItem.datetime, "yyyyMMdd_hhmmss");

  mediaItem.remoteURL = this.getFileUploadLocation(file.name, timeString);

  console.log(mediaItem.remoteURL);

      //Upload to Firebase Cloud Storage
      var uploadTask: AngularFireUploadTask;

      console.log(file.size);

      //Resize the file if it's over 500kb
      if(file.size > 500 * 1024){



          this.imageCompress.compressFile(file, orientation, 50, 50).then(
            result => {

              uploadTask = this.storage.upload(mediaItem.remoteURL, result)

            }
          );
      }
      else{
        uploadTask = this.storage.upload(mediaItem.remoteURL, file);
      }

  // uploadTask = this.storage.upload(mediaItem.remoteURL, file);

  uploadTask.then(result => {
    result.ref.getDownloadURL().then(url => {
      mediaItem.remoteURL = url;

            //Save the new image to the database and update the mediaItemId and its location etc
    let dbSaveResult = this.patientService.savePatientMedia(mediaItem);

    dbSaveResult.then(result => {
      console.log(result);
      mediaItem.mediaItemId = result.mediaItemId;

    }).catch(error => console.log(error))

    });

  })







  //Return an observable of the upload progress.
  return uploadTask.snapshotChanges().pipe(map(s => (s.bytesTransferred / s.totalBytes) * 100));

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
    console.log(url);
    remoteURL = url;
  })


return remoteURL;



}



}
