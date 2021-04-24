import { Image } from './../../../models/media';
import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'media-preview',
  templateUrl: './media-preview.component.html',
  styleUrls: ['./media-preview.component.scss']
})
export class MediaPreviewComponent implements OnInit {
  imageData!:Image;
  recordForm!: FormGroup;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder, 
    private cdr: ChangeDetectorRef,
    public datePipe:DatePipe
  ) { }

  ngOnInit(): void {
    this.imageData = this.data.image;
    this.recordForm = this.fb.group({
      imageDate: [''],
      imageTags:[]
    });
    
    const date = this.datePipe.transform(new Date(`${this.imageData.date}T${this.imageData.time}` as string),'yyyy-MM-ddThh:mm');
    this.recordForm.get('imageDate')?.patchValue(date);
  }

}
