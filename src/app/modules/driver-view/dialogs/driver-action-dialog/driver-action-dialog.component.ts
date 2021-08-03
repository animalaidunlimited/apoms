import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { getCurrentTimeString } from 'src/app/core/helpers/utils';
import { DriverAssignments } from 'src/app/core/models/driver-view';
import { Patient } from 'src/app/core/models/patients';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { LocationService } from 'src/app/core/services/location/location.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { DriverViewService } from '../../services/driver-view.service';

interface DialogData {
  formGroup:FormGroup;
  formBuilderArray: any;
  patientsArray: Patient[];
  subAction: string;
}


@Component({
  selector: 'app-driver-action-dialog',
  templateUrl: './driver-action-dialog.component.html',
  styleUrls: ['./driver-action-dialog.component.scss']
})
export class DriverActionDialogComponent implements OnInit {

minTime!: Date | string;
maxTime!: Date | string;

latLngChanged = false;

dateTimeChanged = false;

errorMatcher = new CrossFieldErrorMatcher();

formGroup = this.data.formGroup;

patientFormGroup = this.data.formGroup.get('patients');

  constructor(public dialogRef: MatDialogRef<DriverActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private driverView: DriverViewService,
    private dropDown: DropdownService,
    private snackBar: SnackbarService,
    private locationService: LocationService) { }

  ngOnInit(): void {

    this.data.formBuilderArray.forEach((fb: any)=> {
      if(fb.type==='datetime-local') {
        this.dateTimeChanged =  this.formGroup.get(fb.formControlName)?.value ? true : false; 
        this.getMinAndMAx(fb);
      }
    });
  }

  async onSubmit(updatedRecord: DriverAssignments) {

    updatedRecord.isUpdated = true;

    const updatedRecordData = this.driverView.getAssignmentStatus(updatedRecord);
    
    const driverViewLocalStorageData: DriverAssignments[] = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('driverViewData'))));

    const index = driverViewLocalStorageData.findIndex(value=> value.emergencyCaseId === updatedRecordData.emergencyCaseId && 
      this.checkAllPatientIds(updatedRecordData.patients, value));

    driverViewLocalStorageData.splice(index,1,updatedRecordData);

    localStorage.setItem('driverViewData', JSON.stringify(driverViewLocalStorageData));

    this.driverView.driverViewDetails.next(JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('driverViewData')))));

    this.snackBar.successSnackBar('Case saved to local storage.','Ok');
  }

  closeDialog() {
    this.dialogRef.close();
  }

  checkAllPatientIds(updatedRecordPatients: Patient[], driverViewData: DriverAssignments) {
    
    return driverViewData.patients.every(patient=> {
      return updatedRecordPatients.findIndex(p=> p.patientId === patient.patientId)>-1 ? true : false;
    });
  }

  getMinAndMAx(fb: any) { 

    if(fb.actionStatus === 'Rescue') {

      if(fb.subAction === 'Arrived') {
        this.minTime = this.formGroup.get('rescueAmbulanceAssignmentDate')?.value ? 
          this.formGroup.get('rescueAmbulanceAssignmentDate')?.value : 
          this.formGroup.get('callDateTime')?.value;

        this.maxTime = this.formGroup.get('ambulanceArrivalTime')?.value ? this.formGroup.get('ambulanceArrivalTime')?.value : getCurrentTimeString();
      }

      if(fb.subAction === 'Rescued') {
        this.minTime = this.formGroup.get('ambulanceArrivalTime')?.value ? this.formGroup.get('ambulanceArrivalTime')?.value : 
        this.formGroup.get('rescueAmbulanceAssignmentDate')?.value;
        this.maxTime = this.formGroup.get('admissionTime')?.value ? this.formGroup.get('admissionTime')?.value : getCurrentTimeString();
      }

      if(fb.subAction === 'Admitted' && this.formGroup.get('rescueTime')?.value) {
        this.minTime = this.formGroup.get('rescueTime')?.value;
        this.maxTime = getCurrentTimeString();
      }

    }

    if(fb.actionStatus === 'Release') {

      if(fb.subAction === 'PickedUp') {
        this.minTime = this.formGroup.get('releaseAmbulanceAssignmentDate')?.value ? 
          this.formGroup.get('releaseAmbulanceAssignmentDate')?.value : 
          this.formGroup.get('callDateTime')?.value;

        this.maxTime = this.formGroup.get('releaseBeginDate')?.value ? this.formGroup.get('releaseBeginDate')?.value : getCurrentTimeString();
      }

      if(fb.subAction === 'Arrived') {
        this.minTime = this.formGroup.get('releasePickupDate')?.value ? this.formGroup.get('releasePickupDate')?.value : 
        this.formGroup.get('releaseAmbulanceAssignmentDate')?.value;
        this.maxTime = this.formGroup.get('releaseEndDate')?.value ? this.formGroup.get('releaseEndDate')?.value : getCurrentTimeString();
      }

      if(fb.subAction === 'Released' && this.formGroup.get('releaseBeginDate')?.value) {
        this.minTime = this.formGroup.get('releaseBeginDate')?.value;
        this.maxTime = getCurrentTimeString();
      }

    }


    if(fb.actionStatus === 'StreetTreat') {

      if(fb.subAction === 'Arrived') {
        this.minTime = this.formGroup.get('streetTreatAmbulanceAssignmentDate')?.value ? 
          this.formGroup.get('streetTreatAmbulanceAssignmentDate')?.value : 
          this.formGroup.get('callDateTime')?.value;

        this.maxTime = this.formGroup.get('visitEndDate')?.value ? this.formGroup.get('visitEndDate')?.value : getCurrentTimeString();
      }

      if(fb.subAction === 'Treated') {
        this.minTime = this.formGroup.get('visitBeginDate')?.value ? this.formGroup.get('visitBeginDate')?.value :  this.formGroup.get('callDateTime')?.value;
        this.maxTime = getCurrentTimeString();
      }


    }

    if(fb.actionStatus === 'STRelease') {

      if(fb.subAction === 'PickedUp') {
        this.minTime = this.formGroup.get('releaseAmbulanceAssignmentDate')?.value ? 
          this.formGroup.get('releaseAmbulanceAssignmentDate')?.value : 
          this.formGroup.get('callDateTime')?.value;

        this.maxTime = this.formGroup.get('releaseBeginDate')?.value ? this.formGroup.get('releaseBeginDate')?.value : getCurrentTimeString();
      }

      if(fb.subAction === 'Arrived') {
        this.minTime = this.formGroup.get('releasePickupDate')?.value ? this.formGroup.get('releasePickupDate')?.value : 
        this.formGroup.get('releaseAmbulanceAssignmentDate')?.value;
        this.maxTime = this.formGroup.get('releaseEndDate')?.value ? this.formGroup.get('releaseEndDate')?.value : getCurrentTimeString();
      }

      if(fb.subAction === 'Released') {
        this.minTime = this.formGroup.get('releaseBeginDate')?.value ? this.formGroup.get('releaseBeginDate')?.value : this.formGroup.get('releasePickupDate')?.value;
        this.maxTime = getCurrentTimeString();
      }

      
      if(fb.subAction === 'Treated') {
        this.minTime = this.formGroup.get('visitBeginDate')?.value ? this.formGroup.get('visitBeginDate')?.value : this.formGroup.get('streetTreatAmbulanceAssignmentDate')?.value ;
        this.maxTime = getCurrentTimeString();
      }


    }
    

  }

  setCurrentDateTime(formControlName: string) {
    
    this.formGroup.get(formControlName)?.setValue(getCurrentTimeString());

    this.dateTimeChanged = true;

    this.formGroup.valueChanges.subscribe(()=> {
      this.updateValueAndValidity(formControlName);
    });

  }

  updateValueAndValidity(formControlName: string) {


    if(formControlName === 'ambulanceArrivalTime') {

      if (
        Date.parse(this.formGroup.get(formControlName)?.value) < Date.parse(this.formGroup.get('callDateTime')?.value) &&
        this.formGroup.get(formControlName)?.value !== ''
      ) {
        this.formGroup.get(formControlName)?.setErrors({ambulanceArrivalBeforeCallDatetime: true});
      }

      if (
        Date.parse(this.formGroup.get(formControlName)?.value) > Date.parse(this.formGroup.get('rescueTime')?.value) &&
        this.formGroup.get('rescueTime')?.value !== '' &&
        this.formGroup.get(formControlName)?.value !== ''
      ) {
        
        this.formGroup.get(formControlName)?.setErrors({ambulanceArrivalAfterRescue: true});
      }
    }


    if(formControlName === 'rescueTime') {
      if (
        Date.parse(this.formGroup.get(formControlName)?.value) < Date.parse(this.formGroup.get('callDateTime')?.value) &&
        this.formGroup.get(formControlName)?.value !== ''
      ) {
        this.formGroup.get(formControlName)?.setErrors({ rescueBeforeCallDatetime: true });
      }

      if (
        Date.parse(this.formGroup.get(formControlName)?.value) < Date.parse(this.formGroup.get('ambulanceArrivalTime')?.value) &&
        this.formGroup.get(formControlName)?.value !== ''
      ) {
        this.formGroup.get(formControlName)?.setErrors({ rescueBeforeAmbulanceArrival: true });
      }

      if (
        Date.parse(this.formGroup.get(formControlName)?.value) > 
        Date.parse(this.formGroup.get('admissionTime')?.value) &&
        this.formGroup.get(formControlName)?.value !== ''
      ) {
        this.formGroup.get(formControlName)?.setErrors({ rescueAfterAdmission: true });
      }
    }


    if(formControlName === 'admissionTime') {
      if (
        Date.parse(this.formGroup.get(formControlName)?.value) < 
        Date.parse(this.formGroup.get('rescueTime')?.value) &&
        this.formGroup.get(formControlName)?.value !== ''
      ) {
        this.formGroup.get(formControlName)?.setErrors({ rescueAfterAdmission: true });
      }

    }



  }

  getCurrentVehiclelocation() {

    const newLatLongLiteral = this.locationService.getCurrentLocation();
    if(newLatLongLiteral) {
      this.formGroup.get('latLngLiteral')?.setValue(newLatLongLiteral);
      this.formGroup.get('isUpdated')?.setValue(true);
      this.latLngChanged = true;
    }

  }


}
