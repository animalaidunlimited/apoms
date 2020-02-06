import { Component, OnInit, HostListener } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadDialog implements OnInit {

  constructor(public dialogRef: MatDialogRef<ImageUploadDialog>) { }

  ngOnInit() {
  }

  onCancel(): void {
    
    this.dialogRef.close();
  }



  
}
