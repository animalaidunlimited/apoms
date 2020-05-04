import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder } from '@angular/forms';
import { UpdatedRescue } from '../../models/outstanding-case';

export interface DialogData {
  emergencyCaseId: number;
  emergencyNumber: number;
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
    private fb:FormBuilder,
    public dialogRef: MatDialogRef<RescueDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    ) {}

  ngOnInit() {

    this.data.recordForm = this.fb.group({

      emergencyDetails: this.fb.group({
        emergencyCaseId: [this.data.emergencyCaseId],
        callDateTime: [''],
        updateTime: ['']
      }),
      callOutcome: this.fb.group({
        callOutcome: ['']
      })
    }
    );

   }

  onCancel(): void {
    this.dialogRef.close(this.result);
  }

  onRescueDetailsResult($event){
    console.log($event);
    // this.dialogRef.close($event);
  }

  onOutcomeResult($event){
    console.log($event);
  }

}
