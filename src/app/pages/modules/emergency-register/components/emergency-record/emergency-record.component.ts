import { Component, OnInit} from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { CrossFieldErrorMatcher } from '../../../../../core/validators/cross-field-error-matcher';

import { getCurrentTimeString } from '../../../../../core/utils';
import { Observable } from 'rxjs';

import { DropdownService, AnimalTypeResponse } from 'src/app/core/services/dropdown/dropdown.service';
import { CaseService } from '../../services/case.service';
import { EmergencyCase } from 'src/app/core/models/emergency-record';
import { UserOptionsService } from 'src/app/core/services/user-options.service';
import { MatSnackBar } from '@angular/material';
import { EmergencyResponse } from 'src/app/core/models/responses';


@Component({
  selector: 'emergency-record',
  templateUrl: './emergency-record.component.html',
  styleUrls: ['./emergency-record.component.scss']
})

export class EmergencyRecordComponent implements OnInit{

  recordForm;

  errorMatcher = new CrossFieldErrorMatcher();

  filteredAreas: Observable<any[]>;

  notificationDurationSeconds;

  dispatchers;
  outcomes;
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
    private caseService: CaseService) {}

ngOnInit()
{

  this.areas = this.dropdowns.getAreas();
  this.dispatchers = this.dropdowns.getDispatchers();
  this.outcomes = this.dropdowns.getOutcomes();

  this.notificationDurationSeconds = this.userOptions.getNotifactionDuration();

  this.recordForm = this.fb.group({

    emergencyDetails: this.fb.group({
      emergencyCaseId: [''],
      emergencyNumber: ['45675', Validators.required],
      callDateTime: [getCurrentTimeString(), Validators.required],
      dispatcher: ['', Validators.required],
      code: ['', Validators.required]
    }),
    patients: this.fb.array([]),
    callerDetails: this.fb.group({
      callerId: [''],
      callerName: ['', Validators.required],
      callerNumber: ['', Validators.required],
      callerAlternativeNumber: ['']
    }),
    callOutcome: this.fb.group({
      callOutcome: ['']
    })
  }
  );

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

  async saveForm()
  {
  //  if(this.recordForm.valid)
  //  {
      let emergencyForm: EmergencyCase = Object.assign({}, {"emergencyForm" : this.recordForm.value});


      if(!emergencyForm.emergencyForm.emergencyDetails.emergencyCaseId)
      {
        await this.caseService.insertCase(emergencyForm)
        .then((data) => {
          console.log(data);

          //let resultBody = data as EmergencyResponse;

          //this.openSnackBar(resultBody.emergencyNumber + " " + resultBody.status, "OK");
          })
          .catch((error) => {
            console.log(error);
          });

      }
      else
      {
        await this.caseService.updateCase(emergencyForm)
        .then((data) => {
          console.log(data);

          //let resultBody = data as EmergencyResponse;

          //this.openSnackBar(resultBody.emergencyNumber + " " + resultBody.status, "OK");
          })
          .catch((error) => {
            console.log(error);
          });

      }



   // }

  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: this.notificationDurationSeconds * 1000,
    });
  }


}
