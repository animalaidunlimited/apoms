import { Component, OnInit, ViewChild, Input, SimpleChanges, OnChanges, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';
import { BehaviorSubject, fromEvent, merge, Observable, Subject } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import { TreatmentRecordComponent } from 'src/app/core/components/treatment-record/treatment-record.component';
import { ActivatedRoute, Router } from '@angular/router';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { Priority } from 'src/app/core/models/priority';
import { PatientEditDialog } from 'src/app/core/components/patient-edit/patient-edit.component';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
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
        animate(2000, style({opacity: 0}))
      ])
    ]),
  ]
})

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

  displayedColumns: Observable<string[]>;
  filteredColumns:Observable<Column[]>;

  incomingList:string|undefined;
  isPrinting = false;

  movedLists!: FormArray;
  otherAreas!: TreatmentArea[];

  refreshing: BehaviorSubject<boolean>;
  resizeObservable$!: Observable<Event>;

  smallScreen = false;

  treatmentListForm: FormGroup;
  treatmentPriorities: Observable<Priority[]>;

  constructor(
    // public dialogRef: MatDialogRef<TreatmentListComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: DialogData,
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


      // Here we're getting the changes from each form in the array, so that we can update the patient details
      // in future releases.
      merge(...this.acceptedFormArray.controls.map((control: AbstractControl, index: number) =>
      control.valueChanges.pipe(
          take(1),
          map(value => ({ rowIndex: index, control })))
      )).subscribe(changes => {

        const updatePatient = {
          patientId: changes.control.get('PatientId')?.value,
          treatmentPriority: changes.control.get('Treatment priority')?.value,
          temperament: changes.control.get('Temperament')?.value || null,
          age: changes.control.get('Age')?.value || null,
          releaseStatus: changes.control.get('Release status')?.value || null,
          abcStatus: changes.control.get('ABC status')?.value || null,
          knownAsName: changes.control.get('Known as name')?.value,
          sex: changes.control.get('Sex')?.value,
          description: changes.control.get('Description')?.value || null,
          mainProblems: changes.control.get('Main Problems')?.value || null,
          animalTypeId: changes.control.get('animalTypeId')?.value
        };

        this.startSave(changes.control);

        this.patientService.updatePatientDetails(updatePatient).then(result => {

          if(result.success === 1){
            this.endSave(changes.control);
          }

        });

        });

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

          mainAreas.push({name: 'Other', type: 'checkbox'});
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

    row.get('saving')?.setValue(true);
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


    if(result[0].success === -1){
      this.snackbar.errorSnackBar('Error moving patient: please see admin', 'OK');
    }

    this.endSave(currentPatient);

  });

}


}

