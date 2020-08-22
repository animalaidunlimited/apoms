import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


export interface DialogData {
  censusUpdateDate : string;
}

@Component({
  selector: 'app-update-census-dialog',
  templateUrl: './update-census-dialog.component.html',
  styleUrls: ['./update-census-dialog.component.scss']
})
export class UpdateCensusDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<UpdateCensusDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit(): void {
  }

  onCancel(): void {
    let value = 1;
    this.dialogRef.close(value);
}

}
