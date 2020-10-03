import { Component, OnInit, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CensusService } from 'src/app/core/services/census/census.service';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

interface ReportPatientRecord {
  emergencynumber: number;
  tagnumber: string;
  species: string;
  callername : string;
  number : number;
  calldate : string;
}

interface DialogData{
areaName : string;
}

@Component({
  selector: 'patient-details-dialog',
  templateUrl: './patient-details-dialog.component.html',
  styleUrls: ['./patient-details-dialog.component.scss']
})


export class PatientDetailsDialogComponent implements OnInit {

  displayedColumns: string[] = ['emergencynumber', 'tagnumber', 'species','callername', 'number', 'calldate'];

  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public dialogRef: MatDialogRef<PatientDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private census: CensusService ) { }

  patientRecords: MatTableDataSource<ReportPatientRecord>;


  ngOnInit() {

    console.log(this.data.areaName)


    this.census.getPatientDetailsByArea(this.data.areaName).then((response: ReportPatientRecord[]) => {

      console.log(response);

      this.patientRecords = new MatTableDataSource(response);
      this.patientRecords.sort = this.sort;

    });
  }


  onCancel(){
    this.dialogRef.close();
  }

}
