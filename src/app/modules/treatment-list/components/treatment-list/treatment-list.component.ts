import { Component, OnInit, ViewChild, Input, SimpleChanges, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CensusService } from 'src/app/core/services/census/census.service';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ABCStatus, Age, ReleaseStatus, Temperament } from 'src/app/core/enums/patient-details';
import { CensusArea, CensusPrintContent, ReportPatientRecord } from 'src/app/core/models/census-details';
import { map, take } from 'rxjs/operators';
import { TreatmentRecordComponent } from 'src/app/core/components/treatment-record/treatment-record.component';
import { Router } from '@angular/router';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { Priority } from 'src/app/core/models/priority';
import { PatientEditDialog } from 'src/app/core/components/patient-edit/patient-edit.component';

interface Column{
  name: string;
  type: string;
}

@Component({
  selector: 'app-treatment-list',
  templateUrl: './treatment-list.component.html',
  styleUrls: ['./treatment-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class TreatmentListComponent implements OnInit, OnChanges {
  @Input() areaName!: string;

  @ViewChild(MatTable, { static: true }) patientTable!: MatTable<any>;
  @ViewChild(MatSort) sort!: MatSort;

  columnsExcludingIndex: Observable<Column[]>;

  displayedColumns: Observable<string[]>;

  columns: BehaviorSubject<Column[]>
          = new BehaviorSubject<Column[]>([
            {name: 'index', type: 'string'},
            {name: 'Tag number', type: 'string'},
            {name: 'Adm', type: 'checkbox'},
            {name: 'Rel', type: 'checkbox'},
            {name: 'Died', type: 'checkbox'}]);


  isPrinting: BehaviorSubject<boolean>;
  layoutType = 'census';
  otherAreas!: CensusArea[];
  patientRecords: MatTableDataSource<ReportPatientRecord>;
  showSpinner = false;
  treatmentPriorities: Observable<Priority[]>;

  constructor(
    // public dialogRef: MatDialogRef<TreatmentListComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dialog: MatDialog,
    private router: Router,
    private printService: PrintTemplateService,
    private changeDetector: ChangeDetectorRef,
    private dropdown: DropdownService,
    private census: CensusService ) {

    this.columnsExcludingIndex = this.columns
                                        .pipe(map(columns =>
                                                    columns.filter(column =>  column.name !== 'index' &&
                                                                              column.name !== this.areaName &&
                                                                              column.name !== 'complete' &&
                                                                              column.name !== 'Other')));

    this.displayedColumns = this.columns.pipe(map(columns => columns.map(column => column.name)));
    this.treatmentPriorities = this.dropdown.getPriority();

    this.populateColumnList();

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
    'Treatment priority': 0,
    showOther: false,
    treatedToday: false};

    this.patientRecords = new MatTableDataSource([emptyReportPatient]);

    }

  ngOnInit() {  }

  ngOnChanges(change:SimpleChanges) : void {

    if(change.areaName.currentValue && change.areaName.currentValue !== ''){

      this.showSpinner = true;

      this.populateColumnList();
      this.loadTreatmentList(change.areaName.currentValue);


    }

  }

  private populateColumnList() : void {

    this.dropdown.getTreatmentListAreas()
    .pipe(
      take(1)
    ).subscribe(areaList => {

      this.otherAreas = areaList.filter(areaGroup => !areaGroup.TreatmentListMain)[0].AreaList
                                                                                        .filter(area => area.areaName !== this.areaName);

      // Here we need to filter down to our main areas that we want to display in the table.
      // Then we also want to filter out the current area from the list too.
      // And finally just return the list of area names
      const mainAreas = areaList
        .filter(areaGroup => areaGroup.TreatmentListMain)[0].AreaList
                                                              .filter(area => area.areaName !== this.areaName)
                                                              .map(area => ({name: area.areaName, type: 'checkbox'}))
                                                              ;

        mainAreas.unshift({name: 'Rel./Died', type: 'button'});
        mainAreas.unshift({name: 'Treatment priority', type: 'select'});
        mainAreas.unshift({name: 'Tag number', type: 'text'});
        mainAreas.unshift({name: 'index', type: 'text'});

        mainAreas.push({name: 'Other', type: 'checkbox'});

      this.columns.next(mainAreas);
    });

  }


  private loadTreatmentList(areaName:string) {

    this.census.getPatientDetailsByArea(areaName).then((response: ReportPatientRecord[]) => {

      response ?
        response = response.map(patient => {

          const patientObject = JSON.parse(JSON.stringify(patient));

          patient['ABC status'] = ABCStatus[patientObject['ABC status']];
          patient['Release status'] = ReleaseStatus[patientObject['Release status']];
          // eslint-disable-next-line @typescript-eslint/dot-notation
          patient['Temperament'] = Temperament[patientObject['Temperament']];
          // patient['Treatment priority'] = TreatmentPriority[patientObject['Treatment priority']];
          // eslint-disable-next-line @typescript-eslint/dot-notation
          patient['Age'] = Age[patientObject['Age']];

          return patient;

        })
        :
        response = [];

      response.sort((a, b) => {

        let sortResult = 0;

        // if (this.getTreatmentPriority(a['Treatment priority']) === this.getTreatmentPriority(b['Treatment priority'])) {
        if ((a['Treatment priority'] || 999) === (b['Treatment priority'] || 999)) {


          sortResult = a['Tag number'] < b['Tag number'] ? -1 : 1;
        }
        else {

          sortResult = (a['Treatment priority'] || 999) > (b['Treatment priority'] || 999) ?
            1 : -1;

        }

        return sortResult;
      });

      this.patientRecords.sortingDataAccessor = (item: ReportPatientRecord, columnHeader: string) => {

        switch (columnHeader) {
          case 'Treatment priority':
            return (item['Treatment priority'] + '').toString();
          default:

            const newObj = JSON.parse(JSON.stringify(item));

            return newObj[columnHeader];
        }

      };


      this.patientRecords = new MatTableDataSource(response);
      this.patientRecords.sort = this.sort;
      this.changeDetector.detectChanges();
      this.showSpinner = false;


    });


  }


  print(){

    // this.dialogRef.close();

     this.columns.subscribe(printColumns => {

      this.patientRecords.connect().subscribe(sortedData => {

        const printContent: CensusPrintContent = {
          area: this.areaName,
          displayColumns: printColumns.map(column => column.name),
          printList: sortedData
         };

         this.printService.sendCensusListToPrinter(JSON.stringify(printContent));

      });
     });
  }

  treatmentLayout(){

    this.columns.next([
      {name: 'index',type: 'string'},
      {name: 'Tag number',type: 'string'},
      {name: 'Age',type: 'string'},
      {name: 'Treatment priority',type: 'string'},
      {name: 'ABC status',type: 'string'},
      {name: 'Release status',type: 'string'},
      {name: 'Temperament',type: 'string'},
      {name: 'Release ready',type: 'string'},
      {name: 'complete',type: 'string'}]);

  }

  censusLayout(){

    this.columns.next([
      {name: 'index', type: 'string'},
      {name: 'Emergency number', type: 'string'},
      {name: 'Tag number', type: 'string'},
      {name: 'Species', type: 'string'},
      {name: 'Caller name', type: 'string'},
      {name: 'Number', type: 'string'},
      {name: 'Call date', type: 'string'}]);

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

    // dialogRef.afterClosed().subscribe(result => {

    //    if (result) {

    //      console.log(result);

    //    }
    // });
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

priorityChanged(element: any, event:any){

  console.log(element);
  console.log(event);
}

quickUpdate(patientId: number, tagNumber: string | undefined) {
  this.dialog.open(PatientEditDialog, {
      width: '500px',
      data: { patientId, tagNumber },
  });
}

}
