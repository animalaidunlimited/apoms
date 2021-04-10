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
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSelectChange } from '@angular/material/select';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { TreatmentService } from 'src/app/core/services/treatment/treatment.service';

interface Column{
  name: string;
  type: string;
  areaId?: number;
  abbreviation?: string;
}

@Component({
  selector: 'app-treatment-list',
  templateUrl: './treatment-list.component.html',
  styleUrls: ['./treatment-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class TreatmentListComponent implements OnInit, OnChanges {
  @Input() area!: CensusArea;

  @ViewChild(MatTable, { static: true }) patientTable!: MatTable<any>;
  @ViewChild(MatSort) sort!: MatSort;

  columns: BehaviorSubject<Column[]>
  = new BehaviorSubject<Column[]>([
    {name: 'index', type: 'text'},
    {name: 'Tag number', type: 'text'},
    {name: 'Treatment priority', type: 'select'},
    {name: 'Other', type: 'select'},
    {name: 'complete', type: 'button'}
  ]);

  displayedColumns: Observable<string[]>;
  filteredColumns:Observable<Column[]>;

  isPrinting: BehaviorSubject<boolean>;
  layoutType = 'census';
  otherAreas!: CensusArea[];
  patientRecords = new BehaviorSubject<AbstractControl[]>([]);
  showSpinner = false;

  treatmentListForm: FormGroup;
  treatmentListArray: FormArray;
  // patientRecords: MatTableDataSource<AbstractControl>;
  treatmentPriorities: Observable<Priority[]>;

  constructor(
    // public dialogRef: MatDialogRef<TreatmentListComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dialog: MatDialog,
    private router: Router,
    private printService: PrintTemplateService,
    private changeDetector: ChangeDetectorRef,
    private ts: TreatmentService,
    private fb: FormBuilder,
    private dropdown: DropdownService,
    private census: CensusService ) {

    this.filteredColumns = this.columns
                                        .pipe(map(columns =>
                                                    columns.filter(column =>  column.name !== 'index' &&
                                                                              column.name !== this.area.areaName &&
                                                                              column.name !== 'complete' &&
                                                                              column.name !== 'Other')));

    this.treatmentPriorities = this.dropdown.getPriority();

    this.populateColumnList();

    this.isPrinting = this.printService.getIsPrinting();

    this.treatmentListForm = this.fb.group({
      treatmentList: this.fb.array([this.getEmptyPatient()])
    });

    this.treatmentListArray = this.treatmentListForm.get('treatmentList') as FormArray;

    this.patientRecords.next(this.treatmentListArray.controls);

    this.displayedColumns = this.columns.pipe(map(columns => columns.map(column => column.name)));

    }

  ngOnInit() {  }

  ngOnChanges(change:SimpleChanges) : void {

    if(change.area.currentValue && change.area.currentValue !== ''){

      this.showSpinner = true;
      this.populateColumnList();
      this.loadTreatmentList(change.area.currentValue.areaName);

    }

  }

  private getEmptyPatient(): FormGroup {


    const returnGroup = this.fb.group({
      index: 0,
      'Emergency number': 0,
      PatientId: 0,
      'Tag number': '',
      Species: '',
      Age: '',
      'Caller name': '',
      Number: 0,
      'Call date': '',
      'ABC status': '',
      'Release ready': false,
      'Release status': '',
      Temperament: '',
      'Treatment priority': 0,
      'Moved to': 0,
      showOther: false,
      treatedToday: false,
      saving: false,
      saved: false
    });

    return returnGroup;
  }

  private populateColumnList() : void {

    this.dropdown.getTreatmentListAreas()
    .pipe(
      take(1)
    ).subscribe(areaList => {
      this.otherAreas = areaList.filter(areaGroup => !areaGroup.TreatmentListMain)[0].AreaList
                                                                                        .filter(area => area.areaName !== this.area.areaName);

      // Here we need to filter down to our main areas that we want to display in the table.
      // Then we also want to filter out the current area from the list too.
      // And finally just return the list of area names
      const mainAreas:Column[] = areaList.filter(areaGroup => areaGroup.TreatmentListMain)[0].AreaList
                                                              .filter(area => area.areaName !== this.area.areaName)
                                                              .map(area => ({name: area.areaName, areaId: area.areaId, abbreviation: area.abbreviation, type: 'checkbox'}));

        mainAreas.unshift({name: 'Rel./Died', type: 'button'});
        mainAreas.unshift({name: 'Treatment priority', type: 'select'});
        mainAreas.unshift({name: 'Tag number', type: 'text'});
        mainAreas.unshift({name: 'index', type: 'text'});

        mainAreas.push({name: 'Other', type: 'checkbox'});
        mainAreas.push({name: 'complete', type: 'button'});

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
          // tslint:disable-next-line: no-string-literal
          patient['Temperament'] = Temperament[patientObject['Temperament']];
          // patient['Treatment priority'] = TreatmentPriority[patientObject['Treatment priority']];
          // tslint:disable-next-line: no-string-literal
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

      this.treatmentListForm.removeControl('treatmentList');
      this.treatmentListForm.addControl('treatmentList', this.getTreatmentListForm(response));
      this.treatmentListArray = this.treatmentListForm.get('treatmentList') as FormArray;

      //this.patientRecords.sortingDataAccessor = (item: ReportPatientRecord, columnHeader: string) => {

      //  switch (columnHeader) {
      //    case 'Treatment priority':
      //      return (item['Treatment priority'] + '').toString();
      //    default:

      //      const newObj = JSON.parse(JSON.stringify(item));

      //      return newObj[columnHeader];
      //  }

      //};


      //this.patientRecords = new MatTableDataSource(sortedTreatmentList.controls);
      //this.patientRecords.sort = this.sort;
      this.patientRecords.next(this.treatmentListArray.controls);
      this.showSpinner = false;
      this.changeDetector.detectChanges();



    });


  }

  getTreatmentListForm(response: ReportPatientRecord[]) : FormArray {

    const returnArray = this.fb.array([]);

    response.forEach(() => returnArray.push(this.getEmptyPatient()));

    returnArray.patchValue(response);

    return returnArray;

  }


  print(){

    // this.dialogRef.close();

    // this.columns.subscribe(printColumns => {

    //  this.patientRecords.connect().subscribe(sortedData => {

    //    console.log(sortedData.values);

    //    const printContent: CensusPrintContent = {
    //      area: this.areaName,
    //      displayColumns: printColumns.map(column => column.name),
    //      printList: []
    //     };

    //    // this.printService.sendCensusListToPrinter(JSON.stringify(printContent));

    //  });
    // });
  }

  treatmentLayout(){

    this.populateColumnList();

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

  toggleTreatment(row:AbstractControl){

    const treated = row.get('treatedToday');

    if(!treated?.value){
      treated?.setValue(!treated.value);
    }

    row.get('saving')?.setValue(true);
    this.openTreatmentDialog(row);

  }

  // TODO type this as a AbstractControl or FormGroup
  openTreatmentDialog(row:AbstractControl): void {

    const dialogRef = this.dialog.open(TreatmentRecordComponent, {
        width: '650px',
        data: {
          patientId: row.get('PatientId')?.value,
          treatmentId: 0
        },
    });

     dialogRef.afterClosed().subscribe(result => {

      row.get('saving')?.setValue(false);
      row.get('saved')?.setValue(true);

      setTimeout(() => {
        row.get('saved')?.setValue(false);
        this.changeDetector.detectChanges();

      }, 2500);

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

priorityChanged(element: ReportPatientRecord, event:any){

  const v = this.treatmentListForm.get('treatmentList') as FormArray;

  console.log(v.at(0)?.value);
}

quickUpdate(patientId: number, tagNumber: string | undefined) {
  this.dialog.open(PatientEditDialog, {
      width: '500px',
      data: { patientId, tagNumber },
  });
}

//areaChanged(event: MatSelectChange, index: number ){

//  console.log(event.value);
//  console.log(index);

//  this.treatmentListArray.at(index).get('Moved to')?.setValue(event.value);

//  this.moveOut(this.treatmentListArray.at(index) as FormGroup);

//}

areaChanged(areaId:number|undefined, index: number){

  this.treatmentListArray.at(index).get('Moved to')?.setValue(areaId);

  this.moveOut(this.treatmentListArray.at(index) as FormGroup);

}

moveOut(currentPatient: FormGroup) : void{

const updatedPatient = {
  currentAreaId: this.area.areaId,
  ...currentPatient.value
};

this.ts.movePatientOutOfArea(updatedPatient);

}

}
