import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


interface DialogData{
  mediaVal : File;
}

@Component({
  selector: 'app-add-search-media-dialog',
  templateUrl: './add-search-media-dialog.component.html',
  styleUrls: ['./add-search-media-dialog.component.scss']
})
export class AddSearchMediaDialogComponent implements OnInit {

  constructor( public dialogRef: MatDialogRef<AddSearchMediaDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData,) { }

  ngOnInit(): void {

    console.log(this.data.mediaVal);

  }

}
