import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DriverAssignments } from 'src/app/core/models/driver-view';
import { Patient } from 'src/app/core/models/patients';

interface DialogData {
assignmentDetails: DriverAssignments;
}

@Component({
  selector: 'app-patient-select-formedia-dialog',
  templateUrl: './patient-select-formedia-dialog.component.html',
  styleUrls: ['./patient-select-formedia-dialog.component.scss']
})
export class PatientSelectFormediaDialogComponent implements OnInit {

  patients!: Patient[];
  formGroup = this.fb.group({});

  constructor(public dialogRef: MatDialogRef<PatientSelectFormediaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.patients = this.data.assignmentDetails.patients;
  }


  closeDialog() {
    this.dialogRef.close();
  }
  

}
