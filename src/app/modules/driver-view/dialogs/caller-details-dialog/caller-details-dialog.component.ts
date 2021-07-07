import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CallerDetails } from 'src/app/core/models/driver-view';

interface DialogData {
  emergencyCaseId: any;
}

@Component({
  selector: 'app-caller-details-dialog',
  templateUrl: './caller-details-dialog.component.html',
  styleUrls: ['./caller-details-dialog.component.scss']
})
export class CallerDetailsDialogComponent implements OnInit {

  callerDetails!: CallerDetails[];
  emergencyDetails: any;
  recordForm!: FormGroup;

  constructor( public dialogRef: MatDialogRef<CallerDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,) { }

  ngOnInit(): void {

    let emergencyDetails = {
      emergencyCaseId: this.data.emergencyCaseId
    };

    this.recordForm.addControl('emergencyDetails', new FormControl(emergencyDetails));


    console.log(this.recordForm.value);

  }

}
