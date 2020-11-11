import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter, OnDestroy, AfterViewInit } from '@angular/core';
import { COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MediaItem } from '../../models/media';
import { FormGroup, FormBuilder, FormArray, AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from '../confirm-dialog/confirmation-dialog.component';
import { PatientService } from 'src/app/modules/emergency-register/services/patient.service';
import { BehaviorSubject, of, Observable } from 'rxjs';
import { getCurrentTimeString } from '../../helpers/utils';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'media-card',
  templateUrl: './media-card.component.html',
  styleUrls: ['./media-card.component.scss']
})
export class MediaCardComponent implements AfterViewInit, OnDestroy, OnInit {

  @Input() mediaItem!: MediaItem;
  @Input() tagNumber!: string;
  @Input() isPrimaryChanged!: BehaviorSubject<number>;
  @Output() itemDeleted: EventEmitter<boolean> = new EventEmitter();
  @Output() updatedMedia: EventEmitter<MediaItem> = new EventEmitter();

  @ViewChild('videoPlayer', { read: ElementRef, static:false }) videoplayer!: ElementRef;

  addOnBlur = true;
  removable = true;
  selectable = true;
  visible = true;
  mediaForm:FormGroup = new FormGroup({});
  tags:FormArray = new FormArray([]);
  mediaSourceURL = '';

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private fb:FormBuilder,
    private patientService: PatientService,
    private dialog: MatDialog) { }

  ngOnInit(): void {

    this.mediaItem.isPrimary = Boolean(this.mediaItem.isPrimary);
    this.mediaForm = this.fb.group({
      mediaItemId: this.mediaItem.mediaItemId,
      patientMediaItemId: this.mediaItem.patientMediaItemId,
      mediaType: this.mediaItem.mediaType,
      patientId: this.mediaItem.patientId,
      localURL: this.mediaItem.localURL,
      remoteURL: this.mediaItem.remoteURL,
      isPrimary: [this.mediaItem.isPrimary],
      datetime: this.mediaItem.datetime,
      comment: [this.mediaItem.comment],
      heightPX: this.mediaItem.heightPX,
      widthPX: this.mediaItem.widthPX,
      tags: this.fb.array([]),
      deleted: false,
      updated: false
    });


    console.log(this.mediaForm.value);



    this.isPrimaryChanged.subscribe(changedPrimaryMediaItemId=>{

      const mediaItemId$ = this.mediaForm.get('mediaItemId')?.value as Observable<number>;

      mediaItemId$.subscribe(itemId=>{
        if(itemId !== changedPrimaryMediaItemId && changedPrimaryMediaItemId !== 0){

          const isPrimaryControl =  this.mediaForm.get('isPrimary') as AbstractControl;

          if(isPrimaryControl.value !== false){

            isPrimaryControl.setValue(false,{emitEvent:false});

            this.mediaForm.markAsTouched();
          }

        }

      });

    });

    this.mediaForm.get('isPrimary')?.valueChanges.subscribe(changedPrimary=>{
      if(changedPrimary){

        setTimeout(()=>{
          this.updatedMedia.emit(this.mediaForm.value);
          this.mediaForm.get('updated')?.setValue(true);
        },0);

      }

      const mediaItemId$ = this.mediaForm.get('mediaItemId')?.value as Observable<number>;
      mediaItemId$.subscribe(mediaId=>{
          this.isPrimaryChanged.next(mediaId);

      });

    });


    this.tags = this.mediaForm.get('tags') as FormArray;

      this.mediaItem.tags.forEach(tag => {

        const newTag = JSON.parse(JSON.stringify(tag));

        this.tags.push(this.fb.control({
          tag: newTag.tag
        }));
      });

      this.mediaSourceURL = this.mediaForm.get('remoteURL')?.value === '' ?
      this.mediaForm.get('localURL')?.value : this.mediaForm.get('remoteURL')?.value;



  }

  ngAfterViewInit(){

    if(this.mediaItem.mediaType.includes('video') && this.mediaItem.heightPX === 0){

      const video: HTMLVideoElement = this.videoplayer.nativeElement;

      video.addEventListener('loadeddata', () => {
        this.mediaItem.heightPX = video.videoHeight;
        this.mediaItem.widthPX = video.videoWidth;
        this.mediaForm.get('heightPX')?.setValue(video.videoHeight);
        this.mediaForm.get('widthPX')?.setValue(video.videoWidth);
        this.mediaForm.get('updated')?.setValue(true);
        this.mediaForm.markAsTouched();
      }, false);

    }

  }

  ngOnDestroy(){

    if(this.mediaForm.touched){
      this.mediaItem.mediaItemId.subscribe((itemId) => {

        this.mediaForm.get('patientMediaItemId')?.setValue(itemId);

        // TODO This is late arriving, it's luckily a timing thing that makes sure there's a value.
        // We should turn this into an observable.
        // this.mediaForm.get('remoteURL')?.setValue(this.mediaItem.remoteURL);
        this.mediaForm.get('updated')?.setValue(true);

        // Save the new or update the media
        this.patientService.savePatientMedia(this.mediaForm.value);

      });

    }

  }

toggleVideo() {
    this.videoplayer.nativeElement.play();
}

add(event: MatChipInputEvent): void {
  const input = event.input;
  const value = event.value;

  this.mediaForm.markAsTouched();

  if ((value || '').trim()) {

    this.tags.push(this.fb.control({
      tag: value.trim()
    }));
  }

  // Reset the input value
  if (input) {
    input.value = '';
  }


}

remove(index: number): void {

  this.mediaForm.markAsTouched();

  this.tags.removeAt(index);

}

deleteMediaItem(){

  const dialogRef = this.dialog.open(ConfirmationDialog,{
    data:{
      message: 'Are you sure want to delete?',
      buttonText: {
        ok: 'Yes',
        cancel: 'No'
      }
    }
  });

  dialogRef.afterClosed().subscribe((confirmed: boolean) => {
    if (confirmed) {
      this.itemDeleted.emit(this.mediaForm.value);
      this.mediaForm.get('deleted')?.setValue(true);
      this.mediaForm.markAsTouched();
    }
  });

}

setInitialTime(event: FocusEvent) {
  let currentTime;
  currentTime = this.mediaForm.get((event.target as HTMLInputElement).name)?.value;

  if (!currentTime) {

      const target = this.mediaForm.get((event.target as HTMLInputElement).name);

      if(target){
          target.setValue(getCurrentTimeString());
      }

  }
}

}
