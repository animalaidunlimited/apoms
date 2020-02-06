import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  tagNumber: string;
}

@Component({
  selector: 'tag-number-dialog',
  templateUrl: './tag-number-dialog.component.html',
  styleUrls: ['./tag-number-dialog.component.scss']
})

export class TagNumberDialog {

  constructor(
    public dialogRef: MatDialogRef<TagNumberDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onCancel(): void {
    
    this.dialogRef.close();
  }

}
