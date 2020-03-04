import { Component, OnInit, Input } from '@angular/core';
import { getCurrentTimeString } from '../../../../../core/utils';
import { CrossFieldErrorMatcher } from '../../../../../core/validators/cross-field-error-matcher';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';

@Component({
  selector: 'rescue-details',
  templateUrl: './rescue-details.component.html',
  styleUrls: ['./rescue-details.component.scss']
})

export class RescueDetailsComponent implements OnInit {

  @Input() recordForm: FormGroup;

  errorMatcher = new CrossFieldErrorMatcher();

  currentCallDateTime;
  currentAdmissionTime;
  currentAmbulanceArrivalTime;
  currentRescueTime;
  currentTime;

  rescuer1;
  rescuer2;
  ambulanceArrivalTime;
  rescueTime;
  admissionTime;
  callDateTime;

  constructor(private dropdowns: DropdownService,
    private fb: FormBuilder) {}
  // constructor(private errorMatcher: CrossFieldErrorMatcher) {}


  rescuer1List;
  rescuer2List;

  ngOnInit() {

    this.rescuer1List = this.dropdowns.getRescuerList();
    this.rescuer2List = this.dropdowns.getRescuerList();

    this.recordForm.addControl(

    "rescueDetails", this.fb.group({
      rescuer1: [''],
      rescuer2: [''],
      ambulanceArrivalTime: [''],
      rescueTime: [''],
      admissionTime: ['']
    })
    )

    this.rescuer1             = this.recordForm.get("rescueDetails.rescuer1");
    this.rescuer2             = this.recordForm.get("rescueDetails.rescuer2");
    this.ambulanceArrivalTime = this.recordForm.get("rescueDetails.ambulanceArrivalTime");
    this.rescueTime           = this.recordForm.get("rescueDetails.rescueTime");
    this.admissionTime        = this.recordForm.get("rescueDetails.admissionTime");
    this.callDateTime         = this.recordForm.get("emergencyDetails.callDateTime");

    this.updateTimes();

    this.onChanges();

  }

updateValidators()
{
 this.ambulanceArrivalTime.clearValidators();
 this.rescueTime.clearValidators();
 this.admissionTime.clearValidators();
 this.rescuer1.clearValidators();
 this.rescuer2.clearValidators();

 this.ambulanceArrivalTime.updateValueAndValidity({emitEvent: false });
 this.rescueTime.updateValueAndValidity({emitEvent: false });
 this.admissionTime.updateValueAndValidity({emitEvent: false });


  //if rescuer1 || rescuer2 then set the other to required
  if(this.rescuer1.value > 0 || this.rescuer2.value > 0)
  {
    this.rescuer2.setValidators([Validators.required]);
    this.rescuer1.setValidators([Validators.required]);
  }

  //if ambulance arrived then rescuer1, rescuer2, resuce time required
  if(this.ambulanceArrivalTime.value != "")
  {
    this.rescuer2.setValidators([Validators.required]);
    this.rescuer1.setValidators([Validators.required]);
  }

  //if rescue time then rescuer1, rescuer2, ambulance arrived required
  if(this.rescueTime.value)
  {
    this.rescuer2.setValidators([Validators.required]);
    this.rescuer1.setValidators([Validators.required]);
  }

  if(this.ambulanceArrivalTime.value < this.callDateTime.value && this.ambulanceArrivalTime.value != "")
  {
    this.ambulanceArrivalTime.setErrors({ "ambulanceArrivalBeforeCallDatetime" : true});
  }

  if(this.ambulanceArrivalTime > this.rescueTime && this.rescueTime.value != "" && this.ambulanceArrivalTime.value != "")
  {
    this.ambulanceArrivalTime.setErrors({ "ambulanceArrivalAfterRescue" : true});
  }

  if(this.rescueTime.value < this.callDateTime.value && this.rescueTime.value != "")
  {
    this.rescueTime.setErrors({ "rescueBeforeCallDatetime" : true});
  }

  if(this.admissionTime.value < this.callDateTime.value && this.admissionTime.value != "")
  {
    this.admissionTime.setErrors({ "admissionBeforeCallDatetime" : true});
  }

  //if admission time then rescuer1, rescuer2, ambulance arrived required, rescue time
  if(this.admissionTime.value)
  {
    this.rescuer2.setValidators([Validators.required]);
    this.rescuer1.setValidators([Validators.required]);

    this.rescueTime.setValidators([Validators.required]);
    this.rescueTime.updateValueAndValidity({emitEvent: false });
  }

  if(this.rescueTime.value > this.admissionTime.value && this.admissionTime.value)
  {
    this.rescueTime.setErrors({"rescueAfterAdmission": true});
    this.admissionTime.setErrors({ "rescueAfterAdmission" : true});
  }

  this.rescuer1.updateValueAndValidity({emitEvent: false });
  this.rescuer2.updateValueAndValidity({emitEvent: false });
}

onChanges(): void {

    this.recordForm.valueChanges.subscribe(val => {

      //The values won't have bubbled up to the parent yet, so wait for one tick
      setTimeout(() =>
        this.updateValidators()
      )

    });
  }

  setInitialTime(event)
  {
    this.currentCallDateTime = this.callDateTime.value;

    let currentTime;

    currentTime = this.recordForm.get("rescueDetails").get(event.target.name).value;

    if(!currentTime)
    {
      this.recordForm.get("rescueDetails").get(event.target.name).setValue(getCurrentTimeString());
    }
   }

  updateTimes()
  {
    this.currentCallDateTime = this.callDateTime.value;

    let currentTime = getCurrentTimeString();

    this.currentRescueTime = this.rescueTime.value || currentTime;
    this.currentAdmissionTime = this.admissionTime.value || currentTime;
    this.currentAmbulanceArrivalTime = this.ambulanceArrivalTime.value || currentTime;

    this.currentTime = currentTime;
  }



}
