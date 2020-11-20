import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '../patient-edit/patient-edit.component';

@Component({
  selector: 'app-assign-release-dialog',
  templateUrl: './assign-release-dialog.component.html',
  styleUrls: ['./assign-release-dialog.component.scss']
})
export class AssignReleaseDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<AssignReleaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit(): void {
  }

}
