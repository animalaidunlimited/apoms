import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter, OnDestroy, AfterViewInit } from '@angular/core';
import { COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { FormGroup, FormBuilder, FormArray, AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { getCurrentTimeString } from 'src/app/core/helpers/utils';
import { MediaItem } from 'src/app/core/models/media';
import { PatientService } from 'src/app/core/services/patient/patient.service';
import { ConfirmationDialog } from '../../confirm-dialog/confirmation-dialog.component';


@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'media-card',
  templateUrl: './media-card.component.html',
  styleUrls: ['./media-card.component.scss']
})
export class MediaCardComponent implements AfterViewInit, OnDestroy, OnInit {

  private ngUnsubscribe = new Subject();

  @Input() mediaItem!: MediaItem;
  @Input() tagNumber!: string;
  @Input() isPrimaryChanged!: BehaviorSubject<number>;

  @Output() itemDeleted: EventEmitter<boolean> = new EventEmitter();
  @Output() updatedMedia: EventEmitter<MediaItem> = new EventEmitter();

  @ViewChild('videoPlayer', { read: ElementRef, static:false }) videoplayer!: ElementRef;

  addOnBlur = true;
  mediaForm:FormGroup = new FormGroup({});
  mediaSourceURL = '';
  selectable = true;
  removable = true;
  tags:FormArray = new FormArray([]);
  visible = true;

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
      isPrimary: this.mediaItem.isPrimary,
      datetime: this.mediaItem.datetime,
      heightPX: this.mediaItem.heightPX,
      widthPX: this.mediaItem.widthPX,
      tags: this.fb.array([]),
      deleted: false,
      updated: this.mediaItem.updated
    });

    if(this.mediaItem.updated){
      this.mediaForm.markAsTouched();
    }

    this.isPrimaryChanged
    ?.pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(changedPrimaryMediaItemId=>{

      const mediaItemId$ = this.mediaForm.get('mediaItemId')?.value as Observable<number>;

      mediaItemId$
      ?.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(itemId => {
        if(itemId !== changedPrimaryMediaItemId && changedPrimaryMediaItemId !== 0){

          const isPrimaryControl =  this.mediaForm.get('isPrimary') as AbstractControl;

          if(isPrimaryControl?.value !== false){

            isPrimaryControl?.setValue(false,{emitEvent:false});

            this.mediaForm.markAsTouched();
          }

        }

      });

    });

    this.mediaForm.get('isPrimary')?.valueChanges
    ?.pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(changedPrimary=>{
      if(changedPrimary){

        setTimeout(()=>{
          this.updatedMedia.emit(this.mediaForm.value);
          this.mediaForm.get('updated')?.setValue(true);
        },0);

      }

      const mediaItemId$ = this.mediaForm.get('mediaItemId')?.value as Observable<number>;
      mediaItemId$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(mediaId=>{
          this.isPrimaryChanged.next(mediaId);

      });

    });


    this.tags = this.mediaForm.get('tags') as FormArray;

      this.mediaItem.tags.forEach((tag:any) => {

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

      const video: HTMLVideoElement = this.videoplayer?.nativeElement;

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

      this.mediaItem.mediaItemId
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((itemId) => {

        this.mediaForm.get('patientMediaItemId')?.setValue(itemId);
        this.mediaForm.get('updated')?.setValue(true);

        // Save the new or update the media
        this.patientService.savePatientMedia(this.mediaForm.value);

      });

    }

    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();

  }

toggleVideo() {
    this.videoplayer?.nativeElement.play();
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

  dialogRef.afterClosed()
  .pipe(takeUntil(this.ngUnsubscribe))
  .subscribe((confirmed: boolean) => {
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
