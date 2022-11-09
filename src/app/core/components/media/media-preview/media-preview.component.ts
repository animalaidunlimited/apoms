import { MediaItem, MediaItemReturnObject, SingleMediaItem } from './../../../models/media';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { Subject } from 'rxjs';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { Platform } from '@angular/cdk/platform';
import { MediaCaptureComponent } from '../media-capture/media-capture.component';
import { OnlineStatusService } from 'src/app/core/services/online-status/online-status.service';
import { takeUntil } from 'rxjs/operators';
import { MediaService } from 'src/app/core/services/media/media.service';
import { ConfirmationDialog } from '../../confirm-dialog/confirmation-dialog.component';
import { getImageLocation } from 'src/app/core/helpers/media';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'media-preview',
  templateUrl: './media-preview.component.html',
  styleUrls: ['./media-preview.component.scss']
})
export class MediaPreviewComponent implements OnInit, OnDestroy {

  recordForm!: FormGroup;

  visible = true;
  removable = true;
  addOnBlur = true;
  selectable = false;
  fullImageView = false;
  imageHeight = 0;
  imageLocation = "";

  loading = false;

  innerWidth = 0;
  innerHeight = 0;

  private ngUnsubscribe = new Subject();

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  onArrowKey = new EventEmitter<number>();  

  onPinch$: Subject<number> = new Subject<number>();

  @ViewChild('tagsControl') tagsControl!: ElementRef<HTMLInputElement>;
  @ViewChild('uploadMediaIcon') uploadMediaIcon!:ElementRef<HTMLElement>;
  @ViewChild('videoPlayer', { static: true }) videoplayer!: ElementRef;
  @ViewChild('imgElement') imgElement!: ElementRef;

  @HostListener('document:keydown', ['$event'])
  onDialog(event: KeyboardEvent): void {

    const lisitenKeys = [37, 38, 39, 40];

    if((event.composedPath()[0] as HTMLElement).classList[0] as string === 'mat-dialog-container'){

      // tslint:disable-next-line: deprecation
      if (lisitenKeys.includes(event.keyCode)) {

        // tslint:disable-next-line: deprecation
        this.onArrowKey.emit(event.keyCode);

      }

    }
  }


  @HostListener('dragover', ['$event'])
  onDragOver(evt:DragEvent) {
    evt.preventDefault();
  }


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: SingleMediaItem,
    private fb: UntypedFormBuilder,
    public datePipe:DatePipe,
    private showSnackBar: SnackbarService,
    public platform: Platform,
    private mediaService: MediaService,
    public dialog: MatDialog,
    public cdr:ChangeDetectorRef,
    private onlineStatus: OnlineStatusService,
    private renderer: Renderer2
  ) {

    // if(this.data.mediaData?.patientMediaItemId){
    //   // tslint:disable-next-line: deprecation
    //   this.commentService.getComments(this.data.mediaData?.patientMediaItemId || -1, 'media')
    //                       .pipe(takeUntil(this.ngUnsubscribe)).
    //                       subscribe((comments:any)=>{
    //                         this.patientMediaComments$.next(comments);
    //                       });
    // }

  }

  ngOnInit(): void {

    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;

    this.recordForm = this.fb.group({
      imageDate: '',
      isPrimary: false,
      imageTags:[],
      imageTagsChips: '',
      currentComment: '',
      deleted: false
    });

    if(this.data.mediaData){

        this.imageLocation = getImageLocation(this.data.mediaData);

        this.recordForm.get('imageDate')?.setValue(this.datePipe.transform(new Date(this.data.mediaData?.datetime as string),'yyyy-MM-ddTHH:mm')),
        this.recordForm.get('imageTags')?.setValue(this.data.mediaData?.tags?.map((tag:any) => tag.tag));
        this.recordForm.get('isPrimary')?.setValue(this.data.mediaData?.isPrimary);

     this.checkHeight();

    }

  }



  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  checkHeight(dialogDataHeight?:number , dialogDataWidth?:number){

    const height = (dialogDataHeight ? dialogDataHeight :  this.data.mediaData?.heightPX) || 0;
    const width = (dialogDataWidth ? dialogDataWidth :  this.data.mediaData?.widthPX) || 0;

    if(height > 2000 && width > 3000){
      this.imageHeight = 24;
    }
    else if(height > 900 && width > 700){
      this.imageHeight = 50;
    }
    else{
      this.imageHeight = 24;
    }
  }

  uploadFile($event:any) : void {

    this.loading = true;

    for(const file of $event?.target?.files ? $event.target.files : $event)
    {

      const mediaItem:MediaItemReturnObject = this.mediaService.handleUpload(file, this.data.patientId);

      this.imageLocation = getImageLocation(mediaItem.mediaItem);

      //Update the media item ID if we're uploading so that the user can update straight away.
      mediaItem.mediaItemId.subscribe(incomingMediaItemId => {

        if(mediaItem.mediaItem) {
          mediaItem.mediaItem.patientMediaItemId = incomingMediaItemId
          this.data.mediaData = mediaItem.mediaItem;
        }

      });

      mediaItem.mediaItemId.pipe(takeUntil(this.ngUnsubscribe)).subscribe(itemId => {

        if(itemId){

          this.recordForm.get('imageDate')?.setValue(this.datePipe.transform(new Date(mediaItem?.mediaItem?.datetime as string),'yyyy-MM-ddTHH:mm'));
          if(this.onlineStatus.connectionChanged.value){
            this.showSnackBar.successSnackBar('Upload successful','OK');
          }

          this.data.upload = false;

          mediaItem.mediaItem?.uploadProgress$?.pipe(takeUntil(this.ngUnsubscribe)).subscribe(progress => this.loading = !(progress === 100 ));

          this.checkHeight(mediaItem.mediaItem?.heightPX, mediaItem.mediaItem?.widthPX);

        }

      });

      if(mediaItem.result === 'nomedia'){

        this.showSnackBar.errorSnackBar('Upload images or video only','OK');
      }
      else if(mediaItem.mediaItem){

        mediaItem.mediaItem.updated = true;
      }

    }

  }


  remove(tags:string): void {

    const index = this.recordForm.get('imageTags')?.value.indexOf(tags);

    if (index >= 0) {
      const imageTags = this.recordForm.get('imageTags')?.value;

      imageTags.splice(index, 1);

      const mediaItem = this.getUpdatedPatientMediaItem();

      this.savePatientMediaItem(mediaItem, true);
    }
  }

  add(event: MatChipInputEvent): void {

    const input = event.input;
    const value = event.value;

    if (value.trim()) {

      this.insertPatientTags(value);

    }

    if (input) {
      input.value = '';
    }

  }

  addTagByButton(event: string){
    if (event.trim()) {
      this.insertPatientTags(event);
      this.tagsControl.nativeElement.value = '';
    }
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
        const mediaItem = this.getUpdatedPatientMediaItem();

        if(mediaItem){
          mediaItem.deleted = true;
        }

        this.savePatientMediaItem(mediaItem, true);
      }
    });


  }

  updateMediaItem(){
    const mediaItem = this.getUpdatedPatientMediaItem();
    this.savePatientMediaItem(mediaItem);
  }

  toggleIsPrimary(){
    let currentIsPrimary = this.recordForm.get('isPrimary');

    currentIsPrimary?.setValue(!currentIsPrimary.value);
    this.recordForm.markAsDirty();

    this.updateMediaItem();
  }

  private insertPatientTags(value: string) {

    if(!this.recordForm.get('imageTags')?.value){

      this.recordForm.get('imageTags')?.setValue([]);

    }

    const imageTags = this.recordForm.get('imageTags')?.value;

    imageTags.push(value);

    this.updateMediaItem();

  }

  private savePatientMediaItem(mediaItem: MediaItem | undefined, removeTag:boolean=false) {

    if(mediaItem && this.recordForm.dirty || removeTag)
    {

      this.mediaService.savePatientMedia(mediaItem as MediaItem).then((uploadResponse) => {

        if (uploadResponse?.success === 1) {

          this.showSnackBar.successSnackBar('Patient media updated successfully', 'OK');
        }
        else {
          this.showSnackBar.errorSnackBar('Error updating patient media', 'OK');
        }

      });
    }
  }

  private getUpdatedPatientMediaItem(): MediaItem | undefined {

    if(!this.data.mediaData) {
      return;
    }

    return {
      ...this.data.mediaData,
      datetime: this.recordForm.get('imageDate')?.value,
      isPrimary: this.recordForm.get('isPrimary')?.value,
      tags: this.recordForm.get('imageTags')?.value?.map((tag: { tag: string; }) => ({ tag })),
      deleted: false
    };
  }

  onBackspaceKeydown(event: Event,tagInputValue:any): void {
    if(tagInputValue === '')
    {
      event.preventDefault();
      this.tagsControl.nativeElement.focus();
    }
  }


  updateDialog(dialogData: SingleMediaItem){

    this.imageLocation = getImageLocation(dialogData.mediaData);

    this.recordForm = this.fb.group({
      imageDate: [
        this.datePipe.transform(new Date(this.data.mediaData?.datetime as string),'yyyy-MM-ddTHH:mm')
        || ''
      ],
      imageTags:[dialogData.mediaData?.tags?.map((tag:any) => tag.tag) || []],
      imageTagsChips: ''
    });

    this.checkHeight(dialogData.mediaData?.heightPX);

    // this.commentService.getComments(this.data.mediaData?.patientMediaItemId as number, 'media').pipe(takeUntil(this.ngUnsubscribe)).subscribe((comments)=>{
    //   this.patientMediaComments$.next(comments);
    // });

  }


  openMobileMediaCaptureDialog(){

    const dialogRef = this.dialog.open(MediaCaptureComponent, {
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'media-capture-dialog',
      data: {
          tagNumber: this.data.tagNumber,
          patientId: this.data.patientId,
      }
    });

  }

  mediaDrag($event:DragEvent){
    $event.preventDefault();
    this.uploadMediaIcon.nativeElement.classList.add('fileDragHover');
  }

  onDragLeave($event:DragEvent){
    this.uploadMediaIcon.nativeElement.classList.remove('fileDragHover');
  }

  mediaDrop($event:DragEvent){
    $event.preventDefault();
    const files = $event?.dataTransfer?.files;
    this.uploadFile(files);
    this.uploadMediaIcon.nativeElement.classList.remove('fileDragHover');
  }

  onSwipeLeft($event:Event){
    this.onArrowKey.emit(39);
  }

  onSwipeRight($event:Event){
    this.onArrowKey.emit(37);
  }

  toggleVideo(event: any) {
    this.videoplayer.nativeElement.play();
  }

  onImageClick($event:Event){


    if(($event.composedPath()[0] as HTMLElement).classList[0] as string === 'mediaPreviewBackgroundImage'){
      $event.preventDefault();
      this.fullImageView = true;
      this.renderer.addClass(this.imgElement.nativeElement ,'fullImageView');
    }


  }

  removeFullView($event:Event){
    $event.preventDefault();
    this.fullImageView = false;
    this.renderer.removeClass(this.imgElement.nativeElement ,'fullImageView');
    Object.defineProperty(window, 'innerWidth', {writable: true, configurable: true, value: this.innerWidth});
    Object.defineProperty(window, 'innerHeight', {writable: true, configurable: true, value: this.innerHeight});


  }



}

