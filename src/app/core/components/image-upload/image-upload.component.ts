import { Component, OnInit, HostListener } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'image-upload',
    templateUrl: './image-upload.component.html',
    styleUrls: ['./image-upload.component.scss'],
})
export class ImageUploadDialog implements OnInit {
    constructor(public MatDialogRef: MatDialogRef<ImageUploadDialog>) {}

    ngOnInit() {}

    onCancel(): void {
        this.MatDialogRef.close();
    }
}
