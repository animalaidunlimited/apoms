import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CallerDetails, DriverAssignments } from 'src/app/core/models/driver-view';

interface DialogData {
  assignmentDetails: DriverAssignments
}

@Component({
  selector: 'app-caller-details-dialog',
  templateUrl: './caller-details-dialog.component.html',
  styleUrls: ['./caller-details-dialog.component.scss']
})
export class CallerDetailsDialogComponent implements OnInit {

  recordForm = this.fb.group({
    emergencyCaseId: [this.data.assignmentDetails.emergencyCaseId],
  });

  constructor( public dialogRef: MatDialogRef<CallerDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder) 
  { }


  ngOnInit(): void { 

  }

  closeDialog() {
    this.dialogRef.close();
  }

}
