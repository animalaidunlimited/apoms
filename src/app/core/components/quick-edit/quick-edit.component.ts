import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface DialogData {
  patientId: number;
  tagNumber: string;
}

@Component({
  selector: 'quick-edit',
  templateUrl: './quick-edit.component.html',
  styleUrls: ['./quick-edit.component.scss']
})
export class QuickEditDialog implements OnInit {

  patientId:number;

  constructor(
    public dialogRef: MatDialogRef<QuickEditDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    ) {}

  ngOnInit() {
    this.patientId = this.data.patientId;
   }

  onCancel(): void {
    this.dialogRef.close();
  }

}
