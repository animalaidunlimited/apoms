import { Component, OnInit, ViewChild, Input, SimpleChanges, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';
import { BehaviorSubject, fromEvent, Observable, Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { TreatmentRecordComponent } from 'src/app/core/components/treatment-record/treatment-record.component';
import { ActivatedRoute, Router } from '@angular/router';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { Priority } from 'src/app/core/models/priority';
import { PatientEditDialog } from 'src/app/core/components/patient-edit/patient-edit.component';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { TreatmentListService } from '../../services/treatment-list.service';
import { TreatmentArea, TreatmentListPrintObject } from 'src/app/core/models/treatment-lists';
import { PatientService } from 'src/app/core/services/patient/patient.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';

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
        animate(2500, style({opacity: 0}))
      ])
    ]),

  //  trigger('fadeSavedIcon', [
  //    state( 'void', style({ opacity: 0 }) ),
  //    state( 'show', style({ opacity: 1 }) ),
  //    state( 'hide', style({ opacity: 0 }) ),
  //    transition('show <=> hide', animate(2000)),
  //]),

      trigger('detailExpand', [
        state('collapsed', style({ height: '0px', minHeight: '0' })),
        state('expanded', style({ height: '*', paddingBottom: '20px' })),
        transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      ])
  ]
})

// trigger('fadeSavedIcon', [
//  state('show', style({ opacity: 1 })),
//  state('hide', style({ opacity: 0 })),
//  state('void', style({ opacity: 0 })),
//  transition('false => true', [animate(2000)])

export class TreatmentListComponent implements OnInit, OnChanges, OnDestroy {

  private ngUnsubscribe = new Subject();

  @Input() area!: TreatmentArea;
  @Input() selectedDate!: Date | string;

  @ViewChild(MatTable, { static: true }) patientTable!: MatTable<any>;
  @ViewChild(MatSort) sort!: MatSort;

  accepted = new BehaviorSubject<AbstractControl[]>([]);
  acceptedFormArray!: FormArray;

  columns: BehaviorSubject<Column[]> = new BehaviorSubject<Column[]>([
                                        {name: 'index', type: 'text'},
                                        {name: 'complete', type: 'button'},
                                        {name: 'Tag number', type: 'text'},
                                        {name: 'Treatment priority', type: 'select'},
                                        {name: 'Other', type: 'select'}
                                      ]);

  columnCountPatientDetails = 5;
  columnCountOther = 5;

  displayedColumns: Observable<string[]>;
  filteredColumns:Observable<Column[]>;

  incomingList:string|undefined;
  isPrinting = false;

  expandedElement: AbstractControl | null = null;

  movedLists!: FormArray;
  otherAreas!: TreatmentArea[];

  refreshing: BehaviorSubject<boolean>;
  resizeObservable$!: Observable<Event>;

  smallScreen = false;

  treatmentListForm: FormGroup;
  treatmentPriorities: Observable<Priority[]>;

  constructor (
    private dialog: MatDialog,
    private router: Router,
    route: ActivatedRoute,
    private snackbar: SnackbarService,
    private changeDetector: ChangeDetectorRef,
    private printService: PrintTemplateService,
    private ts: TreatmentListService,
    private fb: FormBuilder,
    private patientService: PatientService,
    private dropdown: DropdownService ) {

    this.refreshing = this.ts.refreshing;

    // Update the paramters to this component based upon the route parameters if we're trying to print the treatment list
    this.incomingList = route.snapshot.params?.treatmentList;

    if(this.incomingList){

      const incomingDetails:TreatmentListPrintObject = JSON.parse(route.snapshot.params.treatmentList);

      this.isPrinting = !!incomingDetails;

      this.area = incomingDetails?.area;
      this.selectedDate = incomingDetails?.selectedDate;

    }

    this.filteredColumns = this.columns.pipe(map(columns =>
                                          columns.filter(column =>  column.name !== 'index' &&
                                                                    column.name !== this.area.areaName &&
                                                                    column.name !== 'complete' &&
                                                                    column.name !== 'Other')));

    this.treatmentPriorities = this.dropdown.getPriority();

    this.populateColumnList();

    this.treatmentListForm = this.fb.group({});

    this.displayedColumns = this.columns.pipe(map(columns => columns.map(column => column.name)));

    }

  ngOnInit() {

    this.resizeObservable$ = fromEvent(window, 'resize');

    this.resizeObservable$.pipe(
      takeUntil(this.ngUnsubscribe)
    ).subscribe(() => {
      this.smallScreen = window.innerWidth > 840 ? false : true;
      this.populateColumnList();
    });

    this.ts.getTreatmentList().subscribe(treatmentListObject => {

      this.treatmentListForm = treatmentListObject;
      this.acceptedFormArray = this.treatmentListForm.get('accepted') as FormArray;

      this.movedLists = this.treatmentListForm.get('movedLists') as FormArray;

      this.accepted.next(this.acceptedFormArray.controls);

      this.changeDetector.detectChanges();

    });

   }

  ngOnChanges(change:SimpleChanges) : void {

    if(change.hasOwnProperty('area')){
      this.area = change.area.currentValue as TreatmentArea;
    }

    if(change.hasOwnProperty('selectedDate')){
      this.selectedDate = change.selectedDate.currentValue;
    }

    if(this.area && this.selectedDate){

      this.smallScreen = window.innerWidth > 840 ? false : true;

      this.populateColumnList();

      this.ts.populateTreatmentList(this.area.areaId, this.selectedDate);

    }
    else{
      this.ts.resetTreatmentList();
    }

  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  updateTreatmentPriority(patient: AbstractControl){

    this.startSave(patient);

    const updatePatient = this.patientService.getUpdatePatientObject(patient);
    this.changeDetector.detectChanges();

    this.patientService.updatePatientDetails(updatePatient.value).then(result => {

          if(result.success === 1){

            patient.get('patientDetails.treatmentPriority')?.setValue(patient.get('Treatment priority')?.value);

            this.ts.sortTreatmentList();

          }

          this.endSave(patient);

    });

   }



  private populateColumnList() : void {

    this.dropdown.getTreatmentAreas()
    .pipe(
      take(1)
    ).subscribe(areaList => {

      this.otherAreas = areaList.filter(area => area.areaName !== this.area?.areaName && !area.mainArea);

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

          const areas = areaList.filter(area => area.areaName !== this.area?.areaName && area.mainArea)
          .map(area => ({name: area.areaName, areaId: area.areaId, abbreviation: area.abbreviation, type: 'checkbox'}));

          mainAreas.push(...areas);

          mainAreas.push({name: 'Other', type: 'select'});

          this.columnCountPatientDetails = 5;
          this.columnCountOther = 5;
      }
      else {

        this.otherAreas = areaList.filter(area => area.areaName !== this.area?.areaName);

        mainAreas.push({name: 'Other', type: 'select'});

        this.columnCountPatientDetails = 3;
        this.columnCountOther = 1;

      }

      this.columns.next(mainAreas);

      if(this.incomingList){
        this.printService.onDataReady('treatment-list');
      }


    });

  }


  receiveMessage(){
  // TODO On incoming message, search through the treatment lists, find any existing records and remove it. Then add the new one.

  }

  toggleTreatment(row:AbstractControl){

    const treated = row.get('treatedToday');

    if(!treated?.value){
      treated?.setValue(!treated.value);
    }

    row.get('saving')?.setValue(true, {emitEvent: false});
    this.openTreatmentDialog(row);

  }

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

          this.endSave(row);

        }
     });
}

  private startSave(row: AbstractControl) {

    row.get('saving')?.setValue(true, {emitEvent: false});
    row.get('saved')?.setValue(false, {emitEvent: false});
    this.changeDetector.detectChanges();
  }

  private endSave(row: AbstractControl) {

    // Here we want to show the saved icon, but only for a short amount of time.
    row.get('saving')?.setValue(false, {emitEvent: false});
    row.get('saved')?.setValue(true, {emitEvent: false});
    this.changeDetector.detectChanges();


    row.get('saved')?.setValue(false, {emitEvent: false});
    this.changeDetector.detectChanges();

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

quickUpdate(row:AbstractControl) {



  const dialogRef = this.dialog.open(PatientEditDialog, {
      width: '500px',
      data: { patientId: row.get('PatientId')?.value, tagNumber: row.get('Tag number')?.value },
  });


  dialogRef.afterClosed().subscribe((result:AbstractControl) => {

    if (result) {

        row.get('PatientStatusId')?.setValue(result.get('patientStatusId')?.value);
        row.get('PatientStatus')?.setValue(result.get('patientStatus')?.value);
        this.changeDetector.detectChanges();

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

    if(result.success === -1){
      this.snackbar.errorSnackBar('Error moving patient: please see admin', 'OK');
    }

    this.endSave(currentPatient);

  });

}

getUpdatePatientObject(element: AbstractControl) : any{

  return this.patientService.getUpdatePatientObject(element);

}

getUpdatePatientControl(element: AbstractControl) : FormGroup {

  const patientDetails = this.getUpdatePatientObject(element);

  return this.fb.group({patientDetails});

}

savingPatientDetails(saving:boolean, currentPatient:AbstractControl){

  currentPatient.get('Treatment priority')?.setValue(currentPatient.get('patientDetails.treatmentPriority')?.value);

  saving ? this.startSave(currentPatient) : this.endSave(currentPatient);

}

// getEmptyForm(currentPatient:FormGroup){

//  const

//  return this.fb.group({
//    patientDetails: this.fb.group({patientId: currentPatient.get('PatientId')?.value})
//  });

//  return this.ts.getPatientDetailsForm(currentPatient);

//}


}

