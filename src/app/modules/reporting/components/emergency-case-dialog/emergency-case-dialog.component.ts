import { Component, OnInit, ViewChild, Inject, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { EmergencyRecordTable } from 'src/app/core/models/emergency-record';

interface DialogData{
  emergencyCases: EmergencyRecordTable[];
}

@Component({
  selector: 'app-emergency-case-dialog',
  templateUrl: './emergency-case-dialog.component.html',
  styleUrls: ['./emergency-case-dialog.component.scss']
})
export class EmergencyCaseDialogComponent implements OnInit, AfterViewInit {

  dataSource: MatTableDataSource<EmergencyRecordTable>;
  emergencyCaseDate: string | Date;

  displayedColumns: string[] = ['emergencyNumber', 'animalType', 'tagNumber','location','dispatcher','staff1','staff2','callOutcome'];

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public MatDialogRef: MatDialogRef<EmergencyCaseDialogComponent>
  ) {
    this.dataSource = new MatTableDataSource(this.data.emergencyCases);
    this.emergencyCaseDate = this.data.emergencyCases[0]?.callDateTime;
   }

  ngOnInit(){

  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  onCancel(): void {
    this.MatDialogRef.close();
  }

}
