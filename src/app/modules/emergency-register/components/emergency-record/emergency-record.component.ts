import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { CrossFieldErrorMatcher } from '../../../../core/validators/cross-field-error-matcher';

import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { CaseService } from '../../services/case.service';
import { UserOptionsService } from 'src/app/core/services/user-options.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmergencyResponse, PatientResponse, ProblemResponse } from 'src/app/core/models/responses';
import { Observable } from 'rxjs';
import { CallOutcomeResponse } from 'src/app/core/models/call-outcome';
import { UniqueEmergencyNumberValidator } from 'src/app/core/validators/emergency-number.validator';
import { getCurrentTimeString } from 'src/app/core/utils';
import { EmergencyCase } from 'src/app/core/models/emergency-record';



@Component({
  selector: 'emergency-record',
  templateUrl: './emergency-record.component.html',
  styleUrls: ['./emergency-record.component.scss']
})

export class EmergencyRecordComponent implements OnInit{

  @Input() emergencyCaseId:number;
  @Output() public onLoadEmergencyNumber = new EventEmitter<any>();

  recordForm: FormGroup;

  errorMatcher = new CrossFieldErrorMatcher();

  notificationDurationSeconds:number;

  sameAs:boolean;
  sameAsId:number;


  callOutcomes$:Observable<CallOutcomeResponse[]>;
  callOutcomes;

  currentTime:string;


  currentOutcomeId:number;

  constructor(
    private fb: FormBuilder,
    private dropdowns: DropdownService,
    private userOptions: UserOptionsService,
    private _snackBar: MatSnackBar,
    private emergencyNumberValidator:UniqueEmergencyNumberValidator,
    private caseService: CaseService) {}

ngOnInit()
{

  this.callOutcomes$ = this.dropdowns.getCallOutcomes();

  this.notificationDurationSeconds = this.userOptions.getNotifactionDuration();

  this.recordForm = this.fb.group({

    emergencyDetails: this.fb.group({
      emergencyCaseId: [this.emergencyCaseId],
      updateTime: ['']
    }),
    callOutcome: this.fb.group({
      callOutcome: ['']
    })
  });

  let callOutcome = this.recordForm.get("callOutcome") as FormGroup;

  //TODO fix this so that it doesn't break the validity of the form
  // callOutcome.addControl("sameAsNumber", new FormControl(null, [], [this.emergencyNumberValidator.validate(this.recordForm.get("emergencyDetails.emergencyCaseId").value, 0)]));

  callOutcome.addControl("sameAsNumber", new FormControl(null));

  if(this.emergencyCaseId){
    this.initialiseForm();
  }

  this.callOutcomes$.subscribe(callOutcome => {

    this.sameAsId = callOutcome.find(outcome => outcome.CallOutcome === "Same as").CallOutcomeId;

  });
}

  outcomeChanged(){

    this.recordForm.get("callOutcome.sameAsNumber").setValue(null);

    this.sameAs = this.sameAsId === this.recordForm.get('callOutcome.callOutcome').value;

  }

  initialiseForm(){

    this.caseService
    .getCaseById(this.emergencyCaseId)
    .subscribe(result => {
      this.recordForm.patchValue(result);
    });


  }

  getCaseSaveMessage(resultBody:EmergencyResponse){

    let result = {
      message : "Other error - See admin\n",
      failure : 0
    }

     //Check the record succeeded
     if(resultBody.emergencyCaseSuccess == 1){
      result.message = "Success";
     }

     else if(resultBody.emergencyCaseSuccess == 2)
     {
      result.message = "Error adding the record: Duplicate record\n";
      result.failure ++;
     }

     //Check the caller succeeded
     if(resultBody.callerSuccess == 1){
      result.message += "";

     }
     else if (resultBody.callerSuccess == 2){
      result.message += "Error adding the caller: Duplicate record \n";
      result.failure ++;
     }
     else {
      result.message += "Other error - See admin\n";
      result.failure ++;
     }

     //Check all of the patients and their problems succeeded

     //If then don't succeed, build and show an error message
     resultBody.patients.forEach((patient:PatientResponse) => {

       if(patient.success == 1){
        result.message += "";

         let patientFormArray = this.recordForm.get("patients") as FormArray;

         patientFormArray.controls.forEach((currentPatient) => {

           if(currentPatient.get("position").value == patient.position)
           {
             currentPatient.get("patientId").setValue(patient.patientId);
           }

         });
       }
       else{
        result.message += "Error adding the patient: " +
       (patient.success == 2 ? "Duplicate record \n" : "Other error - See admin\n");

       result.failure ++;
       }


       patient.problems.forEach((problem:ProblemResponse) => {

        if(problem.success == 1){
        result.message += ""
       }
       else if (problem.success == 2){
        result.message += "Error adding the patient: Duplicate record \n";
        result.failure ++;
       }
       else{
        result.message += "Error adding the patient: Other error - See admin \n";
        result.failure ++;
       }

       })

     });

     return result;
  }

  async saveForm()
  {
   if(this.recordForm.valid)
   {

    this.recordForm.get('emergencyDetails.updateTime').setValue(getCurrentTimeString());

      let emergencyForm =  {"emergencyForm" : this.recordForm.value} as EmergencyCase;

      if(!emergencyForm.emergencyForm.emergencyDetails.emergencyCaseId)
      {
        await this.caseService.insertCase(emergencyForm)
        .then((data) => {

          let messageResult = {
            failure : 0
          }

          if(data.status == "saved"){

            messageResult.failure = 1;
          }
          else {

            let resultBody = data as EmergencyResponse;

            this.recordForm.get('emergencyDetails.emergencyCaseId').setValue(resultBody.emergencyCaseId);
            this.recordForm.get('callerDetails.callerId').setValue(resultBody.callerId);

            messageResult = this.getCaseSaveMessage(resultBody);
          }

          if(messageResult.failure == 0){
            this.openSnackBar("Case inserted successfully", "OK");
          }
          else if (messageResult.failure == 1)
          {
            this.openSnackBar("Case saved offline", "OK");
          }

          })
          .catch((error) => {
            console.log(error);
          });

      }
      else
      {
        await this.caseService.updateCase(emergencyForm)
        .then((data) => {

          let resultBody = data as EmergencyResponse;

          this.recordForm.get('callerDetails.callerId').setValue(resultBody.callerId);

          var messageResult = this.getCaseSaveMessage(resultBody);

          if(messageResult.failure == 0){
            this.openSnackBar("Case updateted successfully", "OK")
          }
          })
          .catch((error) => {
            console.log(error);
          });

      }
    }
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: this.notificationDurationSeconds * 1000,
    });
  }

  emergencyNumberUpdated(emergencyNumber:number){
    this.onLoadEmergencyNumber.emit(emergencyNumber);
  }

}
