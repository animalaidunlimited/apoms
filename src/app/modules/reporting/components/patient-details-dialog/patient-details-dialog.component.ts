import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CensusService } from 'src/app/core/services/census/census.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ABCStatus, ReleaseStatus, Temperament, TreatmentPriority } from 'src/app/core/enums/patient-details';
import { CensusPrintContent, ReportPatientRecord } from 'src/app/core/models/census-details';
import { map } from 'rxjs/operators';

interface DialogData{
areaName : string;
}

@Component({
  selector: 'patient-details-dialog',
  templateUrl: './patient-details-dialog.component.html',
  styleUrls: ['./patient-details-dialog.component.scss']
})


export class PatientDetailsDialogComponent implements OnInit {

  displayedColumns: BehaviorSubject<string[]>
          = new BehaviorSubject<string[]>(['index','Emergency number','Tag number','Species','Caller name','Number','Call date']);

  columnsExcludingIndex: Observable<string[]>;

  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public dialogRef: MatDialogRef<PatientDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private printService: PrintTemplateService,
    private census: CensusService ) { }

  patientRecords: MatTableDataSource<ReportPatientRecord>;
  isPrinting: BehaviorSubject<boolean>;
  layoutType = 'census';


  ngOnInit() {

    this.columnsExcludingIndex = this.displayedColumns.pipe(map(columns => columns.filter(column => column !== 'index')));

    this.isPrinting = this.printService.getIsPrinting();

    this.census.getPatientDetailsByArea(this.data.areaName).then((response: ReportPatientRecord[]) => {

      response = response.map(patient => {

        patient['ABC status'] = ABCStatus[patient['ABC status']];
        patient['Release status'] = ReleaseStatus[patient['Release status']];
        patient['Temperament'] = Temperament[patient['Temperament']];
        patient['Treatment priority'] = TreatmentPriority[patient['Treatment priority']];

        return patient;

      });

      this.patientRecords = new MatTableDataSource(response);
      this.patientRecords.sort = this.sort;

    });
  }

  print(){

     this.dialogRef.close();

     this.displayedColumns.subscribe(printColumns => {

      const printContent: CensusPrintContent = {
        area: this.data.areaName,
        displayColumns: printColumns,
        printList: this.patientRecords.data
       };

       this.printService.sendCensusListToPrinter(JSON.stringify(printContent));

     });



  }


  onCancel(){

  }

  treatmentLayout(){

    this.displayedColumns.next(['index','Tag number','Treatment priority','ABC status','Release status','Temperament','Release ready']);

  }

  censusLayout(){

    this.displayedColumns.next(['index','Emergency number','Tag number','Species','Caller name','Number','Call date']);


  }

}
