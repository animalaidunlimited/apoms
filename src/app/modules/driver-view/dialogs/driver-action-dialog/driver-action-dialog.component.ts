import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DriverAssignments } from 'src/app/core/models/driver-view';
import { Patient } from 'src/app/core/models/patients';
// import { Patient } from 'src/app/core/models/patients';
import { DriverViewService } from '../../services/driver-view.service';

interface DialogData {
  formGroup:FormGroup,
  formBuilderArray: any
}

@Component({
  selector: 'app-driver-action-dialog',
  templateUrl: './driver-action-dialog.component.html',
  styleUrls: ['./driver-action-dialog.component.scss']
})
export class DriverActionDialogComponent implements OnInit {

formGroup = this.data.formGroup;

  constructor(public dialogRef: MatDialogRef<DriverActionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private driverView: DriverViewService) { }

  ngOnInit(): void {



  }

  async onSubmit(updatedRecord: DriverAssignments) {

    updatedRecord.isUpdated = true;

    let updatedRecordData = this.driverView.getAssignmentStatus(updatedRecord);
    
    let driverViewLocalStorageData: DriverAssignments[] = JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('driverViewData'))));

    let index = driverViewLocalStorageData.findIndex(value=> value.emergencyCaseId === updatedRecordData.emergencyCaseId && 
      this.checkAllPatientIds(updatedRecordData.patients, value));

    driverViewLocalStorageData.splice(index,1,updatedRecordData);

    // let updatedStorageData = driverViewLocalStorageData.splice(index,1,updatedRecordData);

    // console.log(updatedStorageData);

    localStorage.setItem('driverViewData', JSON.stringify(driverViewLocalStorageData));

    this.driverView.driverViewDetails.next(JSON.parse(JSON.parse(JSON.stringify(localStorage.getItem('driverViewData')))));
    
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
