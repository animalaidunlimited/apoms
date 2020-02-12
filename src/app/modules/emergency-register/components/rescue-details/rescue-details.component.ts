import { Component, OnInit, Input } from '@angular/core';
import { getCurrentTimeString } from '../../../../core/utils';
import { CrossFieldErrorMatcher } from '../../../../core/validators/cross-field-error-matcher';
import { FormGroup, Validators } from '@angular/forms';
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
  currentadmissionTime;
  currentRescueTime;
  currentTime;

  driver;
  worker;
  ambulanceArrived;
  rescueTime;
  admissionTime;
  callDateTime;

  constructor(private dropdowns: DropdownService) {}
  // constructor(private errorMatcher: CrossFieldErrorMatcher) {}


  drivers;
  workers;

  ngOnInit() {

    this.drivers = this.dropdowns.getDrivers();
    this.workers = this.dropdowns.getWorkers();

    this.driver             = this.recordForm.get("rescueDetails.driver");
    this.worker             = this.recordForm.get("rescueDetails.worker");
    this.ambulanceArrived   = this.recordForm.get("rescueDetails.ambulanceArrived");
    this.rescueTime         = this.recordForm.get("rescueDetails.rescueTime");
    this.admissionTime      = this.recordForm.get("rescueDetails.admissionTime");
    this.callDateTime       = this.recordForm.get("emergencyDetails.callDateTime");

    this.onChanges();

  }

updateValidators()
{
 this.rescueTime.clearValidators();
 this.callDateTime.clearValidators();
 this.admissionTime.clearValidators();
 this.driver.clearValidators();
 this.worker.clearValidators();
 this.ambulanceArrived.clearValidators();

  //if driver || worker then set the other to required
  if((this.driver.value > 0 || this.worker.value > 0) && !(this.driver.value && this.worker.value))
  {
    this.driver.value > 0   ? this.worker.setValidators([Validators.required])
                            : this.driver.setValidators([Validators.required]);
  }

  //if ambulance arrived then driver, worker, resuce time required
  if(this.ambulanceArrived.value > 1)
  {
    this.worker.setValidators([Validators.required]);
    this.driver.setValidators([Validators.required]);
    this.rescueTime.setValidators([Validators.required]);
    this.rescueTime.updateValueAndValidity({emitEvent: false });
  }

  //if rescue time then driver, worker, ambulance arrived required
  if(this.rescueTime.value)
  {

    this.worker.setValidators([Validators.required]);
    this.driver.setValidators([Validators.required]);

    this.ambulanceArrived.setValidators([Validators.required]);
    this.ambulanceArrived.setErrors({"noAmbulanceArrived": true});
    this.ambulanceArrived.updateValueAndValidity({emitEvent: false });
  }

  if(this.rescueTime.value < this.callDateTime.value && this.rescueTime.value != "")
  {
    this.rescueTime.setErrors({ "rescueBeforeCallDatetime" : true});
  }

  //if admission time then driver, worker, ambulance arrived required, rescue time
  if(this.admissionTime.value)
  {
    this.worker.setValidators([Validators.required]);
    this.driver.setValidators([Validators.required]);

    this.ambulanceArrived.setValidators([Validators.required]);
    this.ambulanceArrived.setErrors({"noAmbulanceArrived": true});

    this.rescueTime.setValidators([Validators.required]);
    this.rescueTime.updateValueAndValidity({emitEvent: false });
  }

  if(this.rescueTime.value > this.admissionTime.value && this.admissionTime.value)
  {
    this.rescueTime.setErrors({"rescueAfterAdmission": true});
    this.admissionTime.setErrors({ "rescueAfterAdmission" : true});
  }
  else
  {
    this.rescueTime.updateValueAndValidity({emitEvent: false });
    this.admissionTime.updateValueAndValidity({emitEvent: false });
  }

  this.driver.updateValueAndValidity({emitEvent: false });
  this.worker.updateValueAndValidity({emitEvent: false });
  this.ambulanceArrived.updateValueAndValidity({emitEvent: false });
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
    let currentTime;

    currentTime = this.recordForm.get("rescueDetails").get(event.target.name).value;

    if(!currentTime)
    {
      this.recordForm.get("rescueDetails").get(event.target.name).setValue(getCurrentTimeString());
    }
   }

  updateTimes()
  {
    this.currentCallDateTime = this.recordForm.get('emergencyDetails.callDateTime').value;

    this.currentRescueTime = this.recordForm.get('rescueDetails.rescueTime').value || getCurrentTimeString();
    this.currentadmissionTime = this.recordForm.get('rescueDetails.admissionTime').value || getCurrentTimeString();

    this.currentTime = getCurrentTimeString();
  }



}
