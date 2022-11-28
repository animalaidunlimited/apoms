import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DriverAssignment } from 'src/app/core/models/driver-view';
import { Patient } from 'src/app/core/models/patients';

interface DialogData {
assignmentDetails: DriverAssignment;
}

@Component({
  selector: 'app-patient-select-for-media-dialog',
  templateUrl: './patient-select-for-media-dialog.component.html',
  styleUrls: ['./patient-select-for-media-dialog.component.scss']
})
export class PatientSelectForMediaDialogComponent implements OnInit {

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
      GUID: '1',
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

  constructor(public MatDialogRef: MatDialogRef<PatientSelectForMediaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: UntypedFormBuilder) { }

  ngOnInit(): void {
    this.patients = this.data.assignmentDetails?.patients;

  }


  closeDialog() {
    this.MatDialogRef.close();
  }


}
