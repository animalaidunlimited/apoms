import { Component, OnInit} from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { CrossFieldErrorMatcher } from '../../../../core/validators/cross-field-error-matcher';

import { getCurrentTimeString } from '../../../../core/utils';
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
    private emergencyCase: CaseService) {}

ngOnInit()
{

  this.areas = this.dropdowns.getAreas();
  this.dispatchers = this.dropdowns.getDispatchers();
  this.outcomes = this.dropdowns.getOutcomes();

  this.notificationDurationSeconds = this.userOptions.getNotifactionDuration();

  this.recordForm = this.fb.group({

    emergencyDetails: this.fb.group({
      emergencyNumber: ['45675', Validators.required],
      callDateTime: [getCurrentTimeString(), Validators.required],
      dispatcher: ['', Validators.required],
      code: ['', Validators.required]
    }),
    animals: this.fb.array([]),
    complainerDetails: this.fb.group({
      complainerName: ['', Validators.required],
      complainerNumber: ['', Validators.required],
      complainerAlternateNumber: ['']
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

  let complainerName = this.recordForm.get('complainerDetails.complainerName');
  let complainerNumber = this.recordForm.get('complainerDetails.complainerNumber');
  let dispatcher = this.recordForm.get("emergencyDetails.dispatcher");

  if((complainerName.value || complainerNumber.value) && !(complainerName.value && complainerNumber.value))
  {
    !!complainerName.value == true  ? complainerNumber.setValidators([Validators.required])
                            : complainerName.setValidators([Validators.required]);
  }

  complainerName.updateValueAndValidity({emitEvent: false });
  complainerNumber.updateValueAndValidity({emitEvent: false });
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

  saveForm()
  {
  //  if(this.recordForm.valid)
  //  {
      let emergencyForm: EmergencyCase = Object.assign({}, {"emergencyForm" : this.recordForm.value});

      this.emergencyCase.addCase(emergencyForm)
      .then((data) => {
        console.log(data);

        //let resultBody = data as EmergencyResponse;

        //this.openSnackBar(resultBody.EmergencyNumber + " " + resultBody.status, "OK");
        });

   // }

  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: this.notificationDurationSeconds * 1000,
    });
  }


}
