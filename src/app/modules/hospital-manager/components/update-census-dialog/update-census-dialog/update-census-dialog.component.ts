import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CensusRecord } from '../../census-details/census-details.component';


export interface DialogData {
  censusUpdateDate : Date;
}

@Component({
  selector: 'app-update-census-dialog',
  templateUrl: './update-census-dialog.component.html',
  styleUrls: ['./update-census-dialog.component.scss']
})
export class UpdateCensusDialogComponent implements OnInit {

  result : CensusRecord
  @Output() public onAdd = new EventEmitter<any>();
  @Output() public onRemove = new EventEmitter<any>();

  constructor(
    public dialogRef: MatDialogRef<UpdateCensusDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit(): void {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onCensusSaveResult(result : CensusRecord){
    let value : any = result;
    this.onAdd.emit(value);
  }
  onCensusRemoveResult(remove : CensusRecord){
    let value : any = remove;
    this.onRemove.emit(value);
  }

}
