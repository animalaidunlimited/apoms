import { Component, OnInit, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

interface DialogData {
  emergencyCaseId: number;
  tagNumber: string | undefined;
  patientId: number;
}


@Component({
  selector: 'app-release-details-dialog',
  templateUrl: './release-details-dialog.component.html',
  styleUrls: ['./release-details-dialog.component.scss']
})
export class ReleaseDetailsDialogComponent implements OnInit {

  formInvalid = true;

  constructor(
    public dialogRef: MatDialogRef<ReleaseDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) { }

  ngOnInit() {
  }

  setFormValidity(isValid:boolean){
    
    this.formInvalid = isValid;
  }

}
