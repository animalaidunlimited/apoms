import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SurgeryRecord } from 'src/app/core/models/surgery-details';
import { PatientCallDialogComponent } from 'src/app/modules/hospital-manager/components/patient-call-dialog/patient-call-dialog.component';

interface DialogData{
  surgeries: SurgeryRecord[];
}

@Component({
  selector: 'surgeries-by-date-dialog',
  templateUrl: './surgeries-by-date-dialog.component.html',
  styleUrls: ['./surgeries-by-date-dialog.component.scss']
})
export class SurgeriesByDateDialogComponent implements OnInit, AfterViewInit  {

  dataSource: MatTableDataSource<SurgeryRecord>;
  surgeryDate: string | Date;

  displayedColumns: string[] = ['tagNumber', 'animalType', 'type', 'surgeon','site','anesthesiaMinutes'];

  @ViewChild(MatSort) sort: MatSort;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public dialogRef: MatDialogRef<PatientCallDialogComponent>
  ) { }

  ngOnInit(){

    this.dataSource = new MatTableDataSource(this.data.surgeries);
    this.surgeryDate = this.data.surgeries[0].date;
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
