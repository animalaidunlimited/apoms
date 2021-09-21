import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DriverAssignment } from 'src/app/core/models/driver-view';
import { Patient } from 'src/app/core/models/patients';

interface DialogData {
assignmentDetails: DriverAssignment;
}

@Component({
  selector: 'app-patient-select-formedia-dialog',
  templateUrl: './patient-select-formedia-dialog.component.html',
  styleUrls: ['./patient-select-formedia-dialog.component.scss']
})
export class PatientSelectFormediaDialogComponent implements OnInit {

  formGroup = this.fb.group({});
  patients: Patient[] = [{
    animalType: 'Dog',
      animalTypeId: 5,
      updated: false,
      tagNumber: 'B105',
      patientId: 1254,
      problems:[{
        problemId:1,
        problem:'Anorexia'
      }],
      callOutcome: {
        CallOutcome: {
          CallOutcome:'Admission',
          CallOutcomeId:1,
          SortOrder:1
        },
        sameAsNumber:0,
      },
      createdDate:'2021-12-21 14:55:16',
      position: 1,
      largeAnimal:0,
      problemsString:'Anorexia',
      duplicateTag:false,
      patientStatusId:1,
      patientStatusDate: '2021-12-21 14:55:45',
      deleted: false,
      isAdmission: false,
      admissionArea: 1,
      admissionAccepted: true,
      treatmentPriority: 1,
      mediaCount: 0

    }];

  constructor(public dialogRef: MatDialogRef<PatientSelectFormediaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder) { }

  ngOnInit(): void {
    this.patients = this.data.assignmentDetails?.patients;

  }


  closeDialog() {
    this.dialogRef.close();
  }


}
