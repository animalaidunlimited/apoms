import { Component, OnInit, ViewChild, Input, SimpleChanges, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';
import { BehaviorSubject, Observable } from 'rxjs';

import { TreatmentListMoveIn, CensusArea, CensusPrintContent, ReportPatientRecord, TreatmentAreaChange } from 'src/app/core/models/census-details';
import { map, take } from 'rxjs/operators';
import { TreatmentRecordComponent } from 'src/app/core/components/treatment-record/treatment-record.component';
import { Router } from '@angular/router';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { Priority } from 'src/app/core/models/priority';
import { PatientEditDialog } from 'src/app/core/components/patient-edit/patient-edit.component';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { TreatmentService } from 'src/app/core/services/treatment/treatment.service';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';
import { trigger, transition, style, animate } from '@angular/animations';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeSavedIcon', [
      transition('* => void', [
        style({ opacity: 1 }),
        animate(2000, style({opacity: 0}))
      ])
    ]),
  ]
})

export class TreatmentListComponent implements OnInit, OnChanges {
  @Input() area!: CensusArea;

  @ViewChild(MatTable, { static: true }) patientTable!: MatTable<any>;
  @ViewChild(MatSort) sort!: MatSort;

  columns: BehaviorSubject<Column[]> = new BehaviorSubject<Column[]>([
                                        {name: 'index', type: 'text'},
                                        {name: 'complete', type: 'button'},
                                        {name: 'Tag number', type: 'text'},
                                        {name: 'Treatment priority', type: 'select'},
                                        {name: 'Other', type: 'select'}
                                      ]);

  displayedColumns: Observable<string[]>;
  filteredColumns:Observable<Column[]>;

  isPrinting: BehaviorSubject<boolean>;
  layoutType = 'census';
  allAreas!: CensusArea[];
  otherAreas!: CensusArea[];
  admissions = new BehaviorSubject<AbstractControl[]>([]);
  patientRecords = new BehaviorSubject<AbstractControl[]>([]);
  unacceptedRecords = new BehaviorSubject<AbstractControl[]>([]);
  rejected  = new BehaviorSubject<AbstractControl[]>([]);
  showSpinner = false;

  treatmentListForm: FormGroup;
  treatmentListArray: FormArray;
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
    private dropdown: DropdownService ) {

    this.filteredColumns = this.columns.pipe(map(columns =>
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
      this.loadTreatmentList(change.area.currentValue.areaId);

    }
  }

  private getEmptyPatient(): FormGroup {


    const returnGroup = this.fb.group({
      treatmentListId: 0,
      index: 0,
      'Emergency number': 0,
      PatientId: 0,
      PatientStatusId: 0,
      PatientStatus: '',
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
      'Move accepted': false,
      Admission: false,
      showOther: false,
      treatedToday: false,
      saving: false,
      saved: false
    });

    return returnGroup;
  }

  private populateColumnList() : void {

    this.dropdown.getTreatmentAreas()
    .pipe(
      take(1)
    ).subscribe(areaList => {

      this.allAreas = areaList.filter(area => area.areaName !== this.area.areaName);

      this.otherAreas = areaList.filter(area => area.areaName !== this.area.areaName && !area.mainArea);

      // Here we need to filter down to our main areas that we want to display in the table.
      // Then we also want to filter out the current area from the list too.
      // And finally just return the list of area names
      const mainAreas:Column[] =  this.allAreas.filter(area => area.areaName !== this.area.areaName && area.mainArea)
                                                .map(area => ({name: area.areaName, areaId: area.areaId, abbreviation: area.abbreviation, type: 'checkbox'}));

        mainAreas.unshift({name: 'Rel./Died', type: 'button'});
        mainAreas.unshift({name: 'Treatment priority', type: 'select'});
        mainAreas.unshift({name: 'Tag number', type: 'text'});
        mainAreas.unshift({name: 'complete', type: 'button'});

        mainAreas.unshift({name: 'index', type: 'text'});

        mainAreas.push({name: 'Other', type: 'checkbox'});

      this.columns.next(mainAreas);
    });

  }


  private loadTreatmentList(censusAreaId:number) {

    this.ts.getTreatmentList(censusAreaId).then((response: ReportPatientRecord[]) => {

      this.treatmentListForm.removeControl('treatmentList');
      this.treatmentListForm.addControl('treatmentList', this.getTreatmentListForm(response));
      this.treatmentListArray = this.treatmentListForm.get('treatmentList') as FormArray;

      this.emitLists();

      this.showSpinner = false;

        this.changeDetector.detectChanges();
    });

  }

  private emitLists() {

    // Let's split the lists into the records that have been accepted by the compounder and those that haven't

    console.log(this.treatmentListArray.controls);

    const admissions =  this.treatmentListArray.controls.filter(element => element.get('Move accepted')?.value === 0 && !!element.get('Admission')?.value === true );
    const acceptedRecords = this.treatmentListArray.controls.filter(element => !!element.get('Move accepted')?.value);
    const unacceptedRecords = this.treatmentListArray.controls.filter(element => element.get('Move accepted')?.value === 0 && !!element.get('Admission')?.value === false);
    const rejected = this.treatmentListArray.controls.filter(element => element.get('Move accepted')?.value === null );

    this.admissions.next(admissions);
    this.patientRecords.next(acceptedRecords);
    this.rejected.next(rejected);
    this.unacceptedRecords.next(unacceptedRecords);

    console.log(admissions);

  }

  receiveMessage(){
  // TODO On incoming message, search through the treatment lists, find any existing records and remove it. Then add the new one.

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

      this.startSave(row);

        if (result) {

          console.log(result);

        }
     });
}

  private startSave(row: AbstractControl) {
    row.get('saving')?.setValue(true);
    row.get('saved')?.setValue(false);
    this.changeDetector.detectChanges();
  }

  private endSave(row: AbstractControl) {
    row.get('saving')?.setValue(false);
    row.get('saved')?.setValue(true);

    this.changeDetector.detectChanges();

    setTimeout(() => {
      row.get('saved')?.setValue(false);
      this.changeDetector.detectChanges();
    }, 2500 );


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

quickUpdate(patientId: number, tagNumber: string | undefined) {

  const dialogRef = this.dialog.open(PatientEditDialog, {
      width: '500px',
      data: { patientId, tagNumber },
  });

  dialogRef.afterClosed().subscribe(result => {

    if (result) {

        console.log(result);

      }
   });


}

areaChanged(areaId:number|undefined, index: number){

  console.log(areaId);

  //this.treatmentListArray.at(index).get('Moved to')?.setValue(areaId);

  //this.moveOut(this.treatmentListArray.at(index) as FormGroup);

    const v = this.treatmentListForm.get('treatmentList') as FormArray;

    console.log(v.at(0)?.value);

}

moveOut(currentPatient: AbstractControl) : void {

  this.startSave(currentPatient);

  const updatedPatient:TreatmentAreaChange = {
    treatmentListId: currentPatient.get('treatmentListId')?.value,
    admission: false,
    patientId: currentPatient.get('PatientId')?.value,
    movedFromArea: this.area.areaId,
    movedToArea: currentPatient.get('Moved to')?.value,
    movedDate: new Date(),
    movedInAccepted: false
  };

  this.ts.movePatientOutOfArea(updatedPatient).then(result => {

    console.log(result);
    this.endSave(currentPatient);

  });

}

acceptMove(currentPatient: AbstractControl) : void {

  const params = this.extractTreatmentListMoveInObject(currentPatient, true);

  this.ts.acceptRejectMoveIn(params).then((response:SuccessOnlyResponse) => {

    if(response.success === 1){

      currentPatient.get('Move accepted')?.setValue(true);

      this.emitLists();
    }

  });
}

rejectMove(currentPatient: AbstractControl) : void {

  const params = this.extractTreatmentListMoveInObject(currentPatient, false);

  this.ts.acceptRejectMoveIn(params).then((response:SuccessOnlyResponse) => {

    if(response.success === 1){

      const patientIdex = this.treatmentListArray.controls.findIndex(element => element.get('PatientId')?.value === currentPatient.get('PatientId')?.value );

      this.treatmentListArray.removeAt(patientIdex);

      this.emitLists();
    }

  });
}

private extractTreatmentListMoveInObject(currentPatient: AbstractControl, accepted: boolean): TreatmentListMoveIn {

  return {
    patientId: currentPatient.get('PatientId')?.value,
    treatmentListId: currentPatient.get('treatmentListId')?.value,
    accepted
  };
}

}

