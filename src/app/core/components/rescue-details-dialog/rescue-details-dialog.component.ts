import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { UpdatedRescue } from '../../models/outstanding-case';

export interface DialogData {
  emergencyCaseId: number;
  recordForm: FormGroup;
}

@Component({
  selector: 'rescue-details-dialog',
  templateUrl: './rescue-details-dialog.component.html',
  styleUrls: ['./rescue-details-dialog.component.scss']
})
export class RescueDetailsDialogComponent implements OnInit {

  result:UpdatedRescue;

  constructor(
    public dialogRef: MatDialogRef<RescueDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    ) {}

  ngOnInit() {
   }

  onCancel(): void {
    this.dialogRef.close(this.result);
  }

  resultReceived($event){
    this.dialogRef.close($event);
  }

}
