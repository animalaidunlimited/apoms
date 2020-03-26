import { Component, OnInit, Input } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { CrossFieldErrorMatcher } from '../../../../../core/validators/cross-field-error-matcher';

import { getCurrentTimeString } from '../../../../../core/utils';
import { Observable } from 'rxjs';

import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { CaseService } from '../../services/case.service';
import { EmergencyCase } from 'src/app/core/models/emergency-record';
import { UserOptionsService } from 'src/app/core/services/user-options.service';
import { MatSnackBar } from '@angular/material';
import { UniqueEmergencyNumberValidator } from 'src/app/core/validators/emergency-number.validator';
import { EmergencyResponse, PatientResponse, ProblemResponse } from 'src/app/core/models/responses';


@Component({
  selector: 'emergency-record',
  templateUrl: './emergency-record.component.html',
  styleUrls: ['./emergency-record.component.scss']
})

export class EmergencyRecordComponent implements OnInit{

  @Input() emergencyCaseId;

  recordForm: FormGroup;

  errorMatcher = new CrossFieldErrorMatcher();

  filteredAreas: Observable<any[]>;

  notificationDurationSeconds;

  dispatchers$;
  callOutcomes$;
  emergencyCodes$
  areas: any[];


  callDateTime = getCurrentTimeString();
  rescueTime:string;
  admissionTime:string;
  currentTime:string;

  constructor(
    private fb: FormBuilder,
    private dropdowns: DropdownService,
    private userOptions: UserOptionsService,
    private _snackBar: MatSnackBar,
    private emergencyNumberValidator: UniqueEmergencyNumberValidator,
    private caseService: CaseService) {}

ngOnInit()
{


  this.areas = this.dropdowns.getAreas();
  this.dispatchers$ = this.dropdowns.getDispatchers();
  this.callOutcomes$ = this.dropdowns.getCallOutcomes();
  this.emergencyCodes$ = this.dropdowns.getEmergencyCodes();

  this.notificationDurationSeconds = this.userOptions.getNotifactionDuration();

  this.recordForm = this.fb.group({

    emergencyDetails: this.fb.group({
      emergencyCaseId: [this.emergencyCaseId],
      emergencyNumber: [, Validators.required, this.emergencyNumberValidator.validate(this.emergencyCaseId)],
      callDateTime: [getCurrentTimeString(), Validators.required],
      dispatcher: ['', Validators.required],
      code: ['', Validators.required],
      updateTime: ['']
    }),
    callOutcome: this.fb.group({
      callOutcome: ['']
    })
  }
  );

  if(this.emergencyCaseId){
    this.initialiseForm();
  }
  
  this.onChanges();
}

updateValidators()
{

  let callerName = this.recordForm.get('callerDetails.callerName');
  let callerNumber = this.recordForm.get('callerDetails.callerNumber');
  let dispatcher = this.recordForm.get("emergencyDetails.dispatcher");

  if((callerName.value || callerNumber.value) && !(callerName.value && callerNumber.value))
  {
    !!callerName.value == true  ? callerNumber.setValidators([Validators.required])
                            : callerName.setValidators([Validators.required]);
  }

  callerName.updateValueAndValidity({emitEvent: false });
  callerNumber.updateValueAndValidity({emitEvent: false });
  dispatcher.updateValueAndValidity({emitEvent: false });
}


onChanges(): void {

    this.recordForm.valueChanges.subscribe(val => {

      //The values won't have bubbled up to the parent yet, so wait for one tick
      setTimeout(() =>
        this.updateValidators()
      )

    });
  }

  async initialiseForm(){

    let currentCase;

    currentCase = await this.caseService.getCaseById(this.emergencyCaseId);

    let model = currentCase;

    //add in the patients and their problems



    this.recordForm.patchValue(model);

    // this.recordForm.patchValue(JSON.parse(currentCase[0][0].Result));

    // this.recordForm.push();



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

  showForm(){
    console.log(this.recordForm);
  }

}
