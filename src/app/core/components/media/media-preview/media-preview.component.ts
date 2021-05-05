import { Image, Comment, MediaItem } from './../../../models/media';
import { Component, ElementRef, EventEmitter, Inject, OnInit, Output, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { PatientService } from 'src/app/core/services/patient/patient.service';
import { BehaviorSubject } from 'rxjs';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
@Component({
  // tslint:disable-next-line: component-selector
  selector: 'media-preview',
  templateUrl: './media-preview.component.html',
  styleUrls: ['./media-preview.component.scss']
})
export class MediaPreviewComponent implements OnInit {
  imageData!:Image;
  recordForm!: FormGroup;
  visible = true;
  removable = true;
  addOnBlur = true;

  @Output() onUpdateMediaItem: EventEmitter<MediaItem> = new EventEmitter();
  
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  patientMediaComments$: BehaviorSubject<Comment[]> = new BehaviorSubject<Comment[]>([]);

  
  @ViewChild('tagsControl') tagsControl!: ElementRef<HTMLInputElement>;
  @ViewChild('commentInput') commentInput!: ElementRef<HTMLInputElement>;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder, 
    public datePipe:DatePipe,
    private patientService:PatientService,
    private showSnackBar: SnackbarService
  ) { 
    this.imageData = this.data.image;
    // tslint:disable-next-line: deprecation
    this.patientService.getPatientMediaComments(this.imageData.patientMediaItemId as number).subscribe((comments)=>{
      this.patientMediaComments$.next(comments);
    });
  }

  ngOnInit(): void {
    
    this.recordForm = this.fb.group({
      imageDate: [this.datePipe.transform(new Date(`${this.imageData.date}T${this.imageData.time}` as string),'yyyy-MM-ddThh:mm')],
      imageTags:[this.imageData.tags?.map((tag:any) => tag.tag)]
    });
  }
  remove(tags:string): void {
    const index = this.recordForm.get('imageTags')?.value.indexOf(tags);
    if (index >= 0) {
      const imageTags = this.recordForm.get('imageTags')?.value;
      imageTags.splice(index, 1);
    }
  }
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    
    if (value.trim()) {
      
      const imageTags = this.recordForm.get('imageTags')?.value;
      imageTags.push(value);
      
      const mediaItem:MediaItem = { 
        ...this.data.mediaData, 
        ...{ 
          tags:imageTags.map((tag:{tag:string}) => ({tag:tag})),
          datetime: this.recordForm.get('imageDate')?.value
        }
      };

      this.patientService.savePatientMedia(mediaItem).then((tagsResponse:any) => {
        if(tagsResponse.success === 1 )
        {
          this.updatedMediaItem(mediaItem);
          this.showSnackBar.successSnackBar('Patient tags updated successfully','OK');
        } 
        else {
          this.showSnackBar.errorSnackBar('Error updating patient tags','OK');
        }
      });

    }

    if (input) {
      input.value = '';
    }

  }
  addTagByBtn(event: string){
    if (event.trim()) {
      const imageTags = this.recordForm.get('imageTags')?.value;
      imageTags.push(event);
      this.tagsControl.nativeElement.value = '';
    }
  }
  submitComment(Event:Event | null): void {
    Event?.preventDefault();
    const comment = Event?.target;
    const commentObject = ({
      patientMediaItemId : this.imageData.patientMediaItemId,
      comment: (comment as HTMLInputElement).value
    });
    const mediaCommentResponse = this.patientService.savePatientMediaComment(commentObject);
    mediaCommentResponse.then((response:{success:number}) => {
      if(response.success === 1){
        this.commentInput.nativeElement.value = '';
        // tslint:disable-next-line: deprecation
        this.patientService.getPatientMediaComments(this.imageData.patientMediaItemId as number).subscribe((comments)=>{
          this.patientMediaComments$.next(comments);
        }); 
      }
    });
  }

  trackComment(index:number, item:any){
    return item.timestamp;
  }

  updateDate(imageDate:string){
    const mediaItem:MediaItem = { 
                      ...this.data.mediaData, 
                      datetime:this.datePipe.transform(new Date(imageDate), 'y-MM-dTHH:mm:ss'),
                      tags: this.recordForm.get('imageTags')?.value.map((tag:{tag:string}) => ({tag:tag}))
                    };
    
    this.patientService.savePatientMedia(mediaItem).then((tagsResponse:any) => {
      if(tagsResponse.success === 1)
      {
        this.showSnackBar.successSnackBar('Patient date and time updated successfully','OK')
        this.updatedMediaItem(mediaItem);
      }
      else{
        this.showSnackBar.errorSnackBar('Error updating patient date and time','OK');
      }
    }); 
  }

  updatedMediaItem(mediaItem:MediaItem){
    this.onUpdateMediaItem.emit(mediaItem);
  }

}

