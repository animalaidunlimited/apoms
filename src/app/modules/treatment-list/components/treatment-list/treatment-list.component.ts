import { Component, OnInit, ViewChild, Input, SimpleChanges, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';
import { BehaviorSubject, fromEvent, Observable, Subject } from 'rxjs';

import { TreatmentListMoveIn, CensusArea, CensusPrintContent, TreatmentList, ReportPatientRecord, TreatmentAreaChange } from 'src/app/core/models/census-details';
import { map, take, takeUntil } from 'rxjs/operators';
import { TreatmentRecordComponent } from 'src/app/core/components/treatment-record/treatment-record.component';
import { Router } from '@angular/router';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { Priority } from 'src/app/core/models/priority';
import { PatientEditDialog } from 'src/app/core/components/patient-edit/patient-edit.component';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';
import { trigger, transition, style, animate } from '@angular/animations';
import { TreatmentListService } from '../../services/treatment-list.service';
import { TreatmeantListObject } from 'src/app/core/models/treatment-lists';

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

export class TreatmentListComponent implements OnInit, OnChanges, OnDestroy {

  private ngUnsubscribe = new Subject();

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
  smallScreen = false;

  otherAreas!: CensusArea[];
  accepted = new BehaviorSubject<AbstractControl[]>([]);
  acceptedFormArray!: FormArray;
  movedLists!: FormArray;

  resizeObservable$!: Observable<Event>;

  showSpinner = false;

  treatmentListForm: FormGroup;
  treatmentPriorities: Observable<Priority[]>;

  constructor(
    // public dialogRef: MatDialogRef<TreatmentListComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dialog: MatDialog,
    private router: Router,
    private printService: PrintTemplateService,
    private changeDetector: ChangeDetectorRef,
    private ts: TreatmentListService,
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

    this.treatmentListForm = this.fb.group({});

    this.displayedColumns = this.columns.pipe(map(columns => columns.map(column => column.name)));

    }

  ngOnInit() {

    this.resizeObservable$ = fromEvent(window, 'resize')
    this.resizeObservable$.pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe( evt => {
      this.smallScreen = window.innerWidth > 840 ? false : true;
      this.populateColumnList();
    });

    this.ts.getTreatmentList().subscribe(treatmentListObject => {

      this.treatmentListForm = treatmentListObject;
      this.acceptedFormArray = this.treatmentListForm.get('accepted') as FormArray;

      this.movedLists = this.treatmentListForm.get('movedLists') as FormArray;

      this.accepted.next(this.acceptedFormArray.controls);

      this.showSpinner = false;

      this.changeDetector.detectChanges();

    });

   }

  ngOnChanges(change:SimpleChanges) : void {

    if(change.area.currentValue && change.area.currentValue !== ''){

      this.smallScreen = window.innerWidth > 840 ? false : true;

      this.showSpinner = true;
      this.populateColumnList();
      this.ts.populateTreatmentList(change.area.currentValue.areaId);

    }

    // this.accepted.subscribe(val => console.log(val));
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
}



  private populateColumnList() : void {

    this.dropdown.getTreatmentAreas()
    .pipe(
      take(1)
    ).subscribe(areaList => {

      this.otherAreas = areaList.filter(area => area.areaName !== this.area.areaName && !area.mainArea);

      // Here we need to filter down to our main areas that we want to display in the table.
      // Then we also want to filter out the current area from the list too.
      // And finally just return the list of area names
      const mainAreas:Column[] = [];

      if(!this.smallScreen){

          mainAreas.push({name: 'index', type: 'text'});
          mainAreas.push({name: 'complete', type: 'button'});

      }

          mainAreas.push({name: 'Tag number', type: 'text'});
          mainAreas.push({name: 'Treatment priority', type: 'select'});
          mainAreas.push({name: 'Rel./Died', type: 'button'});

      if(!this.smallScreen){

          const areas = areaList.filter(area => area.areaName !== this.area.areaName && area.mainArea)
          .map(area => ({name: area.areaName, areaId: area.areaId, abbreviation: area.abbreviation, type: 'checkbox'}));

          mainAreas.push(...areas);

          mainAreas.push({name: 'Other', type: 'checkbox'});
      }

      this.columns.next(mainAreas);
    });

  }


  receiveMessage(){
  // TODO On incoming message, search through the treatment lists, find any existing records and remove it. Then add the new one.

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

  const acceptedArray = this.treatmentListForm.get('accepted') as FormArray;

  const movedPatient = acceptedArray.at(index);

  movedPatient.get('Moved to')?.setValue(areaId);
  this.changeDetector.detectChanges();

  this.moveOut(movedPatient);

}

moveOut(currentPatient: AbstractControl) : void {

  this.startSave(currentPatient);

  this.ts.movePatientOutOfArea(currentPatient, this.area.areaId).then(result => {

    this.endSave(currentPatient);

  });

}




}

