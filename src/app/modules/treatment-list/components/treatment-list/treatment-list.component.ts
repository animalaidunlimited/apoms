import { Component, OnInit, ViewChild, Input, SimpleChanges, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';
import { BehaviorSubject, fromEvent, Observable, Subject } from 'rxjs';
import { filter, map, take, takeUntil } from 'rxjs/operators';
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
      trigger('detailExpand', [
        state('collapsed', style({ height: '0px', minHeight: '0' })),
        state('expanded', style({ height: '*', paddingBottom: '20px' })),
        transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      ])
  ]
})

export class TreatmentListComponent implements OnInit, OnChanges, OnDestroy {

  private ngUnsubscribe = new Subject();

  @Input() area!: TreatmentArea;
  @Input() selectedDate!: Date | string;

  @ViewChild(MatTable, { static: true }) patientTable!: MatTable<any>;
  @ViewChild(MatSort) sort!: MatSort;

  accepted = new BehaviorSubject<AbstractControl[]>([]);

  acceptedFiltered = new BehaviorSubject<AbstractControl[]>([]);
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

  filterValue = '';

  filteredColumns:Observable<Column[]>;
  filteredMovedInColumns:Observable<Column[]>;

  incomingList:string|undefined;
  isPrinting = false;

  expandedElement: AbstractControl | null = null;

  movedInArray = new BehaviorSubject<AbstractControl[]>([]);

  movedInColumns: BehaviorSubject<Column[]> = new BehaviorSubject<Column[]>([
    {name: 'index', type: 'text'},
    {name: 'complete', type: 'button'},
    {name: 'Tag number', type: 'text'},
    {name: 'Treatment priority', type: 'select'},
    {name: 'Other', type: 'select'}
  ]);
  movedInDisplayColumns:Observable<string[]>;;

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

      this.movedInArray.next(this.ts.getMovedInArray());

    }

    this.filteredColumns = this.columns.pipe(map(columns =>
                                          columns.filter(column =>  column.name !== 'index' &&
                                                                    column.name !== this.area.areaName &&
                                                                    column.name !== 'complete' &&
                                                                    column.name !== 'Other')));

this.filteredMovedInColumns = this.movedInColumns.pipe(map(columns =>
  columns.filter(column =>  column.name !== 'index' &&
                            column.name !== this.area.areaName &&
                            column.name !== 'complete' &&
                            column.name !== 'Moved to' &&
                            column.name !== 'Other')));

    this.treatmentPriorities = this.dropdown.getPriority();

    this.populateColumnList();

    this.treatmentListForm = this.fb.group({});

    this.displayedColumns = this.columns.pipe(map(columns => columns.map(column => column.name)));
    this.movedInDisplayColumns = this.movedInColumns.pipe(map(columns => columns.map(column => column.name)));

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
      this.acceptedFiltered.next(this.accepted.value);

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

    if(!this.ts.hasPermission.value){
      this.snackbar.errorSnackBar('You do not have permission to save; please see the admin' , 'OK');
      return;
    }

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

      this.populatemovedInColumns(areaList);

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

          const areas = this.filterAreaList(areaList);

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



  populatemovedInColumns(areaList: TreatmentArea[]) : void {

    const movedInColumns:Column[] = [];

    movedInColumns.push({name: 'index', type: 'text'});
    movedInColumns.push({name: 'complete', type: 'button'});

    movedInColumns.push({name: 'Tag number', type: 'text'});
    movedInColumns.push({name: 'Treatment priority', type: 'select'});
    movedInColumns.push({name: 'Rel./Died', type: 'button'});

    movedInColumns.push({name: 'Admission', type: 'checkbox'});

    const areas = this.filterAreaList(areaList);

    movedInColumns.push(...areas);

    movedInColumns.push({name: 'Other', type: 'select'});
    movedInColumns.push({name: 'Moved to', type: 'select'});

    this.movedInColumns.next(movedInColumns);


  }

  private filterAreaList(areaList: TreatmentArea[]) {
    return areaList.filter(area => area.areaName !== this.area?.areaName && area.mainArea)
      .map(area => ({ name: area.areaName, areaId: area.areaId, abbreviation: area.abbreviation, type: 'checkbox' }));
  }

  applyFilter(event: Event) : void {

    //Get the incoming value from the filtre input
    const filterValue = (event.target as HTMLInputElement).value;

    //Get the value from the accepted list (AbstractControl[]), then filter it down to tjhe matching values
    const filteredArray = this.accepted.value
                                        .filter(patient =>
                                            (patient.get('Tag number')?.value as string).toLowerCase().includes(filterValue.toLowerCase())
                                        );

    //Emit the newly filtered list
    this.acceptedFiltered.next(filteredArray);

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

  if(!this.ts.hasPermission.value){
    this.snackbar.errorSnackBar('You do not have permission to save; please see the admin' , 'OK');
    return;
  }



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

  if(!this.ts.hasPermission.value){
    this.snackbar.errorSnackBar('You do not have permission to save; please see the admin' , 'OK');
    return;
  }

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

getTreatmntPriority(element: number) : string {

  const treatmentPriorities = ["Low","Medium","High","Urgent"];

  return treatmentPriorities[element - 1];



}


}

