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



  patientRecords: MatTableDataSource<ReportPatientRecord>
  isPrinting: BehaviorSubject<boolean>;
  layoutType = 'census';

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public dialogRef: MatDialogRef<PatientDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private printService: PrintTemplateService,
    private census: CensusService ) {

    this.columnsExcludingIndex = this.displayedColumns.pipe(map(columns => columns.filter(column => column !== 'index')));

    this.isPrinting = this.printService.getIsPrinting();

    const emptyReportPatient:ReportPatientRecord = {'Emergency number': 0,
    'Tag number': '',
    Species: '',
    'Caller name' : '',
    Number : 0,
    'Call date' : '',
    'ABC status': '',
    'Release ready': false,
    'Release status': '',
    Temperament: '',
    'Treatment priority': ''};

    this.patientRecords = new MatTableDataSource([emptyReportPatient]);



    }

  ngOnInit() {

    this.census.getPatientDetailsByArea(this.data.areaName).then((response: ReportPatientRecord[]) => {

      response = response.map(patient => {

        const patientObject = JSON.parse(JSON.stringify(patient));

        patient['ABC status'] = ABCStatus[patientObject['ABC status']];
        patient['Release status'] = ReleaseStatus[patientObject['Release status']];
        patient['Temperament'] = Temperament[patientObject['Temperament']];
        patient['Treatment priority'] = TreatmentPriority[patientObject['Treatment priority']];

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
