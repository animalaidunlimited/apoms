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
    this.minTime = getCurrentTimeString();
    this.maxTime = getCurrentTimeString();
    
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

  setCurrentDateTime(formControlName: string) {
    
    this.formGroup.get(formControlName)?.setValue(getCurrentTimeString());

    this.dateTimeChanged = true;

    this.formGroup.valueChanges.subscribe((value)=> {
      console.log(value);
      this.updateValueAndValidity(formControlName);
    });

  }

  updateValueAndValidity(formControlName: string) {


    if(formControlName === 'ambulanceArrivalTime') {

      console.log(this.formGroup.get('rescueTime')?.value);
      console.log(this.formGroup.get(formControlName)?.value);

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

  getCurrentlocation() {

    const ambulanceId = this.formGroup.get('ambulanceAction')?.value === 'Rescue' ? 
    this.formGroup.get('rescueAmbulanceId')?.value :
    this.formGroup.get('ambulanceAction')?.value === 'Release' ? 
    this.formGroup.get('releaseAmbulanceId')?.value :
    this.formGroup.get('ambulanceAction')?.value === 'StreetTreat' || 'STRelease' ?
    this.formGroup.get('streetTreatAmbulanceId')?.value : null;


   

    const newLatLongLiteral = this.locationService.getVehicleLocation(ambulanceId);

    if(newLatLongLiteral) {
      this.formGroup.get('latLngLiteral')?.setValue(newLatLongLiteral);
      this.formGroup.get('isUpdated')?.setValue(true);
      this.latLngChanged = true;
    }

    console.log(this.formGroup.value);

  }


}
