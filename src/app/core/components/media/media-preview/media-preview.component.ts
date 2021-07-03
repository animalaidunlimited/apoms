import { Image, Comment, MediaItem, MediaItemReturnObject } from './../../../models/media';
import {  ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Inject, OnChanges, OnDestroy, OnInit,Renderer2,SimpleChanges,ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { PatientService } from 'src/app/core/services/patient/patient.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { Platform } from '@angular/cdk/platform';
import { MediaPasteService } from 'src/app/core/services/navigation/media-paste/media-paste.service';
import { MediaCaptureComponent } from '../media-capture/media-capture.component';
import {ɵunwrapSafeValue as unwrapSafeValue} from '@angular/core';
import { OnlineStatusService } from 'src/app/core/services/online-status/online-status.service';
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'media-preview',
  templateUrl: './media-preview.component.html',
  styleUrls: ['./media-preview.component.scss']
})
export class MediaPreviewComponent implements OnInit, OnDestroy {

  imageData!:Image;
  recordForm!: FormGroup;
  visible = true;
  removable = true;
  addOnBlur = true;
  selectable = false;
  fullImageView = false;
  imageHeight = 0;
  
  loading = false;

  mediaItems: MediaItem [] = [];

  innerWidth = 0;
  innerHeight = 0;
  
  private ngUnsubscribe = new Subject();

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  onArrowKey = new EventEmitter<number>();

  patientMediaComments$: BehaviorSubject<Comment[]> = new BehaviorSubject<Comment[]>([]);


  onPinch$: Subject<number> = new Subject<number>();

  @ViewChild('tagsControl') tagsControl!: ElementRef<HTMLInputElement>;
  @ViewChild('commentInput') commentInput!: ElementRef<HTMLInputElement>;
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
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public datePipe:DatePipe,
    private patientService:PatientService,
    private showSnackBar: SnackbarService,
    public platform: Platform,
    private mediaPaster: MediaPasteService,
    public dialog: MatDialog,
    public cdr:ChangeDetectorRef,
    private onlineStatus: OnlineStatusService,
    private renderer: Renderer2
  ) {

    if(this.data?.image){
      
      this.imageData = this.data.image;
      // tslint:disable-next-line: deprecation
      this.patientService.getPatientMediaComments(this.imageData.patientMediaItemId as number).subscribe((comments)=>{
        this.patientMediaComments$.next(comments);
      });
    }

  }

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;
    this.recordForm = this.fb.group({
      imageDate: '',
      imageTags:[],
      imageTagsChips: ''
    });
   
    if(!this.data?.upload){
     

      if(this.imageData){
        this.recordForm.get('imageDate')?.setValue(this.datePipe.transform(new Date(`${this.imageData.date}T${this.imageData.time}` as string),'yyyy-MM-ddThh:mm')),
        this.recordForm.get('imageTags')?.setValue(this.data.mediaData.tags?.map((tag:any) => tag.tag));
      }

     this.checkHeight();

    }
    
  }

  checkHeight(dialogDataHeight?:number , dialogDataWidth?:number){

    const height = dialogDataHeight ? dialogDataHeight :  this.data.image?.height;
    const width = dialogDataWidth ? dialogDataWidth :  this.data.image?.width;
    
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

      const mediaItem:MediaItemReturnObject = this.mediaPaster.handleUpload(file, this.data.patientId);

      mediaItem.mediaItemId.subscribe(media => {
        
        if(media){

          this.imageData = { 
           full: mediaItem.mediaItem?.remoteURL !== '' ? mediaItem.mediaItem?.remoteURL as string :  unwrapSafeValue(mediaItem.mediaItem?.localURL) ,
           thumbnail:  mediaItem?.mediaItem?.remoteURL as string,
           type:  mediaItem?.mediaItem?.mediaType as string
          }; 

          this.recordForm.get('imageDate')?.setValue(this.datePipe.transform(new Date(mediaItem?.mediaItem?.datetime as string),'yyyy-MM-ddThh:mm'));
          if(this.onlineStatus.connectionChanged.value){
            this.showSnackBar.successSnackBar('Uploaded','OK');
          }
          
          this.data.upload = false;

          mediaItem.mediaItem?.uploadProgress$?.subscribe(progress => this.loading = !(progress === 100 ));

          this.data.mediaData = mediaItem.mediaItem;  

          this.data.mediaData.patientMediaItemId = media;

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

  addTagByBtn(event: string){
    if (event.trim()) {
      this.insertPatientTags(event);
      this.tagsControl.nativeElement.value = '';
    }
  }

  submitComment(Event:Event | null): void {

 
    Event?.preventDefault();
    const comment = Event?.target;
    const patientMediaItemId = this.imageData.patientMediaItemId ? this.imageData.patientMediaItemId : this.data.mediaData.patientMediaItemId ;

    const commentObject = ({
      patientMediaItemId,
      comment: (comment as HTMLInputElement).value
    });


    const mediaCommentResponse = this.patientService.savePatientMediaComment(commentObject);
    
    mediaCommentResponse.then((response:{success:number}) => {
      
      if(response.success === 1){
        this.commentInput.nativeElement.value = '';
        // tslint:disable-next-line: deprecation
        this.patientService.getPatientMediaComments(patientMediaItemId).subscribe((comments)=>{
          this.patientMediaComments$.next(comments);
        });
      }
    });
  }

  trackComment(index:number, item:any){
    return item.timestamp;
  }

  updateDate(){
    const mediaItem = this.getUpdatedPatientMediaItem();

    this.savePatientMediaItem(mediaItem);
  }

  private insertPatientTags(value: string) {

    if(!this.recordForm.get('imageTags')?.value){

      this.recordForm.get('imageTags')?.setValue([]);
     
    }

    const imageTags = this.recordForm.get('imageTags')?.value;

    imageTags.push(value);

    const mediaItem = this.getUpdatedPatientMediaItem();

    this.savePatientMediaItem(mediaItem);
    
  }



  private savePatientMediaItem(mediaItem: MediaItem, removeTag:boolean=false) {

    if(this.recordForm.dirty || removeTag)
    {
      
      this.patientService.savePatientMedia(mediaItem).then((tagsResponse: any) => {
       
        if (tagsResponse.success === 1) {

          this.showSnackBar.successSnackBar('Patient tags updated successfully', 'OK');
        }
        else {
          this.showSnackBar.errorSnackBar('Error updating patient tags', 'OK');
        }

      });
    }
  }

  private getUpdatedPatientMediaItem(): MediaItem {
    return {
      ...this.data.mediaData,
      datetime: this.recordForm.get('imageDate')?.value,
      tags: this.recordForm.get('imageTags')?.value?.map((tag: { tag: string; }) => ({ tag }))
    };
  }

  onBackspaceKeydown(event: Event,tagInputValue:any): void {
    if(tagInputValue === '')
    {
      event.preventDefault();
      this.tagsControl.nativeElement.focus();
    }
  }


  updateDialog(dialogData: any){
    this.imageData = dialogData.image;

    this.recordForm = this.fb.group({
      imageDate: [ this.imageData ?
        this.datePipe.transform(new Date(`${this.imageData.date}T${this.imageData.time}` as string),'yyyy-MM-ddThh:mm')
        : ''
      ],
      imageTags:[this.imageData ? dialogData.mediaData?.tags?.map((tag:any) => tag.tag) : []],
      imageTagsChips: ''
    });

    this.checkHeight(dialogData.image.height);

    this.patientService.getPatientMediaComments(this.imageData.patientMediaItemId as number).subscribe((comments)=>{
      this.patientMediaComments$.next(comments);
    });
    
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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

