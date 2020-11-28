import { Input } from '@angular/core';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { MediaDialogComponent } from 'src/app/core/components/media-dialog/media-dialog.component';
import { SearchResponse } from 'src/app/core/models/responses';
import { CaseService } from '../../services/case.service';


interface DialogData{
  mediaVal : File[];
}

@Component({
  selector: 'app-add-search-media-dialog',
  templateUrl: './add-search-media-dialog.component.html',
  styleUrls: ['./add-search-media-dialog.component.scss']
})
export class AddSearchMediaDialogComponent implements OnInit {

  @Input() mediaVal!: File[];

  searchResults$!:Observable<SearchResponse[]>;

  constructor(
              public dialogRef: MatDialogRef<AddSearchMediaDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: DialogData,
              public dialog: MatDialog,
              private caseService: CaseService
              ) { }

  ngOnInit(): void {

    console.log(this.data.mediaVal);

  }

  onSearchQuery(searchQuery:string){

    this.searchResults$ = this.caseService.searchCases(searchQuery);

  }

  openMediaDialog(tagNumber: string, patientId: number) {
      this.dialog.open(MediaDialogComponent, {
          minWidth: '50%',
          data: {
              tagNumber,
              patientId,
              mediaVal: this.mediaVal
          }
  });

  }



}
