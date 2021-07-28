import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { getCurrentTimeString } from 'src/app/core/helpers/utils';
import { DriverAssignments } from 'src/app/core/models/driver-view';
import { Patient } from 'src/app/core/models/patients';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { DriverViewService } from '../../services/driver-view.service';

interface DialogData {
  formGroup:FormGroup,
  formBuilderArray: any,
  patientsArray: Patient[]
}


@Component({
  selector: 'app-driver-action-dialog',
  templateUrl: './driver-action-dialog.component.html',
  styleUrls: ['./driver-action-dialog.component.scss']
})
export class DriverActionDialogComponent implements OnInit {

formGroup = this.data.formGroup;

patientFormGroup = this.data.formGroup.get('patients');

  constructor(public dialogRef: MatDialogRef<DriverActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private driverView: DriverViewService,
    private dropDown: DropdownService,
    private snackBar: SnackbarService) { }

  ngOnInit(): void {
    
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



}
