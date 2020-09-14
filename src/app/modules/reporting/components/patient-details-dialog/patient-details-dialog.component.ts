import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CensusService } from 'src/app/core/services/census/census.service';
import { MatTableDataSource, MatTable } from '@angular/material/table';

interface ReportPatientRecord {
  emergencynumber: number;
  tagnumber: string;
  species: string;
  callername : string;
  number : number;
  calldate : string;
}

interface DialogData{
areaName : string
}

@Component({
  selector: 'patient-details-dialog',
  templateUrl: './patient-details-dialog.component.html',
  styleUrls: ['./patient-details-dialog.component.scss']
})


export class PatientDetailsDialogComponent implements OnInit {

  @ViewChild(MatTable) table: MatTable<any>;

  displayedColumns: string[] = ['emergencynumber', 'tagnumber', 'species','callername',
  'number', 'calldate'];

  constructor(
    public dialogRef: MatDialogRef<PatientDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private census : CensusService ) { }

  patientRecords = new MatTableDataSource<ReportPatientRecord>();


  ngOnInit() {
    this.census.getPatientDetialsByArea(this.data.areaName).then((response: ReportPatientRecord[])=>{
      this.patientRecords = new MatTableDataSource(response)
    });
  }

  onCancel(){
    this.dialogRef.close();
  }

}
