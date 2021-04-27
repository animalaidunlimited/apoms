import { Image } from './../../../models/media';
import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

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
  @ViewChild('tagsControl') tagsControl!: ElementRef<HTMLInputElement>;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder, 
    private cdr: ChangeDetectorRef,
    public datePipe:DatePipe
  ) { }

  ngOnInit(): void {
    console.log(this.data.image);
    this.imageData = this.data.image;
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
}

