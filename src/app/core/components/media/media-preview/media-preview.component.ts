import { Image, Comment } from './../../../models/media';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { PatientService } from 'src/app/core/services/patient/patient.service';
import { BehaviorSubject } from 'rxjs';
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
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  patientMediaComments$: BehaviorSubject<Comment[]> = new BehaviorSubject<Comment[]>([]);

  
  // patientMediaComments$!: Observable<any> | undefined;
  @ViewChild('tagsControl') tagsControl!: ElementRef<HTMLInputElement>;
  @ViewChild('commentInput') commentInput!: ElementRef<HTMLInputElement>;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder, 
    public datePipe:DatePipe,
    private patientService:PatientService
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
}

