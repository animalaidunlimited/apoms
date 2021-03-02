import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CensusService } from 'src/app/core/services/census/census.service';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ABCStatus, Age, ReleaseStatus, Temperament, TreatmentPriority } from 'src/app/core/enums/patient-details';
import { CensusPrintContent, ReportPatientRecord } from 'src/app/core/models/census-details';
import { map } from 'rxjs/operators';
import { TreatmentRecordComponent } from 'src/app/core/components/treatment-record/treatment-record.component';
import { Router } from '@angular/router';

//interface DialogData{
//areaName : string;
//}

@Component({
  selector: 'app-treatment-list',
  templateUrl: './treatment-list.component.html',
  styleUrls: ['./treatment-list.component.scss']
})


export class TreatmentListComponent implements OnInit {

  displayedColumns: BehaviorSubject<string[]>
          = new BehaviorSubject<string[]>(['index','Emergency number','Tag number','Species','Caller name','Number','Call date']);

  columnsExcludingIndex: Observable<string[]>;

  patientRecords: MatTableDataSource<ReportPatientRecord>;
  isPrinting: BehaviorSubject<boolean>;
  layoutType = 'census';

  @ViewChild(MatTable, { static: true }) patientTable!: MatTable<any>;

  @ViewChild(MatSort) sort!: MatSort;

  @Input() areaName!: string;

  constructor(
    // public dialogRef: MatDialogRef<TreatmentListComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dialog: MatDialog,
    private router: Router,
    private printService: PrintTemplateService,
    private census: CensusService ) {

    this.columnsExcludingIndex = this.displayedColumns.pipe(map(columns => columns.filter(column => column !== 'index' && column !== 'complete')));

    this.isPrinting = this.printService.getIsPrinting();

    const emptyReportPatient:ReportPatientRecord = {'Emergency number': 0,
    PatientId: 0,
    'Tag number': '',
    Species: '',
    Age: '',
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


    this.census.getPatientDetailsByArea(this.areaName).then((response: ReportPatientRecord[]) => {

      response ?
          response = response.map(patient => {

            const patientObject = JSON.parse(JSON.stringify(patient));

            patient['ABC status'] = ABCStatus[patientObject['ABC status']];
            patient['Release status'] = ReleaseStatus[patientObject['Release status']];
            // tslint:disable-next-line:no-string-literal
            patient['Temperament'] = Temperament[patientObject['Temperament']];
            patient['Treatment priority'] = TreatmentPriority[patientObject['Treatment priority']];
            // tslint:disable-next-line:no-string-literal
            patient['Age'] = Age[patientObject['Age']];

            return patient;

          })
        :
          response = [];

      response.sort((a,b) => {

        let sortResult = 0;

        if(this.getTreatmentPriority(a['Treatment priority'].toString()) === this.getTreatmentPriority(b['Treatment priority'].toString())){

          sortResult = a['Tag number'] < b['Tag number'] ? -1 : 1;
        }
        else {

          sortResult = this.getTreatmentPriority(a['Treatment priority'].toString()) < this.getTreatmentPriority(b['Treatment priority'].toString()) ?
          1 : -1;

        }

        return sortResult;
      });

      this.patientRecords = new MatTableDataSource(response);

      this.patientRecords.sortingDataAccessor = (item: ReportPatientRecord, columnHeader:string) => {

      switch(columnHeader){
        case 'Treatment priority' :
          return this.getTreatmentPriority((item['Treatment priority'] + '').toString()).toString();
        default :

        const newObj = JSON.parse(JSON.stringify(item));

        return newObj[columnHeader];
      }

     };


      this.patientRecords.sort = this.sort;


    });


  }
  getTreatmentPriority(treatmentPriority:string) : number {

    switch(treatmentPriority){
      case 'High' :
        return 3;
      case 'Medium' :
        return 2;
      case 'Low' :
        return 1;
      default :
        return 0;
    }

  }


  print(){

    // this.dialogRef.close();

     this.displayedColumns.subscribe(printColumns => {

      this.patientRecords.connect().subscribe(sortedData => {

        const printContent: CensusPrintContent = {
          area: this.areaName,
          displayColumns: printColumns,
          printList: sortedData
         };

         this.printService.sendCensusListToPrinter(JSON.stringify(printContent));


      });



     });

  }


  //onCancel(){

  //  this.dialogRef.close();

  //}

  treatmentLayout(){

    this.displayedColumns.next(['index','Tag number','Age','Treatment priority','ABC status','Release status','Temperament','Release ready','complete']);


  }

  censusLayout(){

    this.displayedColumns.next(['index','Emergency number','Tag number','Species','Caller name','Number','Call date']);

  }

  toggleTreatment(row:ReportPatientRecord){

    if(!row.treatedToday){
      row.treatedToday = !row.treatedToday;

    }

    this.openTreatmentDialog(row);

  }

  openTreatmentDialog(row:ReportPatientRecord): void {

    const dialogRef = this.dialog.open(TreatmentRecordComponent, {
        width: '650px',
        data: {
          patientId: row.PatientId,
          treatmentId: 0
        },
    });

    dialogRef.afterClosed().subscribe(result => {

        if (result) {

          console.log(result);

        }
    });
}

cellClicked(cell:string, value:any){

    if(cell === 'Tag number'){

      this.openHospitalManagerRecord(value);

    }

}

openHospitalManagerRecord(tagNumber: string){

  this.router.navigate(['/nav/hospital-manager', {tagNumber}], { replaceUrl: true });
  this.dialog.closeAll();

}


}
