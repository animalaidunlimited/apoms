import { Component, OnInit} from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { CrossFieldErrorMatcher } from '../../../../core/validators/cross-field-error-matcher';

import { getCurrentTimeString } from '../../../../core/utils';
import { Observable } from 'rxjs';

import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';


@Component({
  selector: 'emergency-record',
  templateUrl: './emergency-record.component.html',
  styleUrls: ['./emergency-record.component.scss']
})

export class EmergencyRecordComponent implements OnInit{


  recordForm;

  errorMatcher = new CrossFieldErrorMatcher();

  filteredAreas: Observable<any[]>;

  dispatchers;
  outcomes;
  areas: any[];

  callDateTime = getCurrentTimeString();
  rescueTime:string;
  admissionTime:string;
  currentTime:string;

  constructor(private fb: FormBuilder, private dropdowns: DropdownService) {}

ngOnInit()
{
  this.areas = this.dropdowns.getAreas();
  this.dispatchers = this.dropdowns.getDispatchers();
  this.outcomes = this.dropdowns.getOutcomes();

  this.recordForm = this.fb.group({

    emergencyDetails: this.fb.group({
      emergencyNumber: ['45675', Validators.required],
      callDateTime: [getCurrentTimeString(), Validators.required],
      dispatcher: ['', Validators.required]
    }),
    animals: this.fb.array([]),
    complainerDetails: this.fb.group({
      complainerName: ['', Validators.required],
      complainerNumber: ['', Validators.required],
      complainerAlternateNumber: ['']
    }),
    rescueDetails: this.fb.group({
      driver: [''],
      worker: [''],
      ambulanceArrived: [''],
      rescueTime: [''],
      admissionTime: ['']
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
  // let animalArea = this.recordForm.get('locationDetails.animalArea');
  // let animalLocation = this.recordForm.get('locationDetails.animalLocation');
  let dispatcher = this.recordForm.get("emergencyDetails.dispatcher");


  if((complainerName.value || complainerNumber.value) && !(complainerName.value && complainerNumber.value))
  {
    !!complainerName.value == true  ? complainerNumber.setValidators([Validators.required])
                            : complainerName.setValidators([Validators.required]);
  }

  // if((animalArea.value || animalLocation.value) && !(animalArea.value && animalLocation.value))
  // {
  //   !!animalArea.value == true  ? animalLocation.setValidators([Validators.required])
  //                           : animalArea.setValidators([Validators.required]);
  // }

  complainerName.updateValueAndValidity({emitEvent: false });
  complainerNumber.updateValueAndValidity({emitEvent: false });
  // animalArea.updateValueAndValidity({emitEvent: false });
  // animalLocation.updateValueAndValidity({emitEvent: false });
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

    console.log(this.recordForm);
    alert(this.recordForm.valid);
  }


}
