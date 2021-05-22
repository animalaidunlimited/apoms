import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-emergency-record-comment-dialog',
  templateUrl: './emergency-record-comment-dialog.component.html',
  styleUrls: ['./emergency-record-comment-dialog.component.scss']
})
export class EmergencyRecordCommentDialogComponent implements OnInit {

  caseComment = new FormControl("");
  constructor( 
    public dialogRef: MatDialogRef<EmergencyRecordCommentDialogComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: {caseComment: string}
  ) { }

  ngOnInit(): void {
    console.log(this.data);
    this.caseComment.setValue(this.data.caseComment);
  }

  saveComment():void{
    this.dialogRef.close(this.caseComment.value);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
