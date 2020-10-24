import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CensusService } from 'src/app/core/services/census/census.service';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ABCStatus, ReleaseStatus, Temperament, TreatmentPriority } from 'src/app/core/enums/patient-details';
import { CensusPrintContent, ReportPatientRecord } from 'src/app/core/models/census-details';
import { map } from 'rxjs/operators';
import { MatChip } from '@angular/material/chips';
import { TreatmentRecordComponent } from 'src/app/core/components/treatment-record/treatment-record.component';
import { ConfirmationDialog } from 'src/app/core/components/confirm-dialog/confirmation-dialog.component';
import { TreatmentService } from 'src/app/core/services/treatment/treatment.service';

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

  patientRecords: MatTableDataSource<ReportPatientRecord>;
  isPrinting: BehaviorSubject<boolean>;
  layoutType = 'census';

  @ViewChild(MatTable, { static: true }) patientTable!: MatTable<any>;

  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public dialogRef: MatDialogRef<PatientDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dialog: MatDialog,
    private printService: PrintTemplateService,
    private treatmentService: TreatmentService,
    private census: CensusService ) {

    this.columnsExcludingIndex = this.displayedColumns.pipe(map(columns => columns.filter(column => column !== 'index' && column !== 'complete')));

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
    'Treatment priority': '',
    treatedToday: false};

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

    this.dialogRef.close();

  }

  treatmentLayout(){

    this.displayedColumns.next(['index','Tag number','Treatment priority','ABC status','Release status','Temperament','Release ready','complete']);

  }

  censusLayout(){

    this.displayedColumns.next(['index','Emergency number','Tag number','Species','Caller name','Number','Call date']);

  }

  toggleTreatment(row:ReportPatientRecord){

    row.treatedToday = !row.treatedToday;

    if(row.treatedToday){
      this.openTreatmentDialog(row);
    }
    else {

      const dialogRef = this.dialog.open(ConfirmationDialog,{
        data:{
          message: 'Do you want to clear today\'s treatment(s) for this patient?',
          buttonText: {
            ok: 'Yes',
            cancel: 'Cancel'
          }
        }
      });

      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed) {

          // To do clear the treatment for this date
          this.treatmentService.deleteTreatmentsByDate(new Date());

        }
      });

    }

  }

  openTreatmentDialog(row:ReportPatientRecord): void {

    const dialogRef = this.dialog.open(TreatmentRecordComponent, {
        width: '650px',
        data: {
        },
    });

    dialogRef.afterClosed().subscribe(result => {

        if (result) {

        }
    });
}

}
