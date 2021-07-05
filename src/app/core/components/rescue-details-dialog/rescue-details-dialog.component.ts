import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder } from '@angular/forms';
import { UpdateResponse } from '../../models/outstanding-case';
import { CaseService } from 'src/app/modules/emergency-register/services/case.service';
import { PatientResponse } from '../../models/responses';

interface DialogData {
    emergencyCaseId: number;
    emergencyNumber: number;
    CallOutcomeId: number;
    CallOutcome: string;
    sameAsNumber: number;
    recordForm: FormGroup;
}

interface CanExitChange {
    outcomeUpdateComplete: number;
    rescueDetailsUpdateComplete: number;
}

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'rescue-details-dialog',
    templateUrl: './rescue-details-dialog.component.html',
    styleUrls: ['./rescue-details-dialog.component.scss'],
})
export class RescueDetailsDialogComponent implements OnInit {
    result: UpdateResponse;
    canExit: FormGroup = new FormGroup({});

  constructor(
    private fb:FormBuilder,
    private detector: ChangeDetectorRef,
    private caseService: CaseService,
    public dialogRef: MatDialogRef<RescueDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {

      this.result = {
        success: 0,
        socketEndPoint: ''
      };

    }

  ngOnInit() {


    // In this record form we added a updateFromRescueDialog flag to differentiate between the form coming from ER and this form because in both we are trying to add or update patient
    // and also using the ER route. So it will be helpful to tell that the form is from rescue details dialog or from emergency register, If you see the emergency register router file
    // in api you'll see why i added this flag.
    this.data.recordForm = this.fb.group({

      emergencyDetails: this.fb.group({
        emergencyCaseId: [this.data.emergencyCaseId],
        callDateTime: [''],
        updateTime: ['']
      }),
      updateFromRescueDialog: [true]
    });

    this.canExit = this.fb.group({
      outcomeUpdateComplete: [0],
      rescueDetailsUpdateComplete: [0]
    });

    this.canExit.valueChanges.subscribe((values:CanExitChange) => {

      // TODO update this to handle any errors and display them to a toast.
      if(values.rescueDetailsUpdateComplete !== 0){

        this.result.success = 1;

        this.dialogRef.close(this.result);
        this.detector.detectChanges();
      }
    });

    this.detector.detectChanges();

   }

  onCancel(): void {
    this.dialogRef.close(this.result);
  }

  onRescueDetailsResult(result:UpdateResponse){
    this.canExit.get('rescueDetailsUpdateComplete')?.setValue(result.success);
  }

  // saveRescueUpdate() {

  //   // Here we are using the EmergencyRegister route not the patient route because we are updating the patient rescue and its the part of the emergency outstanding board.
  //   this.caseService.insertOrUpdatePatientFromRescueDetailsDialog(this.data.recordForm.value)
  //   .then(output=> {

  //     let success = 0;

  //     output.forEach((patient: PatientResponse)=> {

  //       if(patient.success) {
  //         success = patient.success
  //       }

  //     });

  //   this.canExit.get('outcomeUpdateComplete')?.setValue(success);


  //   });
  // }
}
