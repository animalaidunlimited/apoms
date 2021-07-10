import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DriverAssignments } from 'src/app/core/models/driver-view';

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
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit(): void {



  }

  Submit(formgroup: any) { 
    console.log(formgroup);
  }

  closeDialog() {
    this.dialogRef.close();
  }



}
