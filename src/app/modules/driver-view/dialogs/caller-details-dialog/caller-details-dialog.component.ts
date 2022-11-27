import { Inject } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { DriverAssignment } from 'src/app/core/models/driver-view';

interface DialogData {
  assignmentDetails: DriverAssignment
}

@Component({
  selector: 'app-caller-details-dialog',
  templateUrl: './caller-details-dialog.component.html',
  styleUrls: ['./caller-details-dialog.component.scss']
})
export class CallerDetailsDialogComponent implements OnInit {

  recordForm = this.fb.group({
    emergencyCaseId: [this.data.assignmentDetails?.emergencyCaseId],
  });

  constructor( public dialogRef: MatDialogRef<CallerDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: UntypedFormBuilder) 
  { }


  ngOnInit(): void { 

  }

  closeDialog() {
    this.dialogRef.close();
  }

}
