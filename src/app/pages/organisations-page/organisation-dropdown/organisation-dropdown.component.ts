import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component,  Input,  OnDestroy,  OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatTable } from '@angular/material/table';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { UniqueValidators } from 'src/app/core/components/patient-visit-details/unique-validators';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';

interface Dropdown{
  dropdown: string;
  displayName: string;
  request: string;
}


 @Component({
  selector: 'aau-organisation-dropdown',
  templateUrl: './organisation-dropdown.component.html',
  styleUrls: ['./organisation-dropdown.component.scss']
})

export class OrganisationDropdownComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();



  @ViewChild(MatTable) table!: MatTable<Element>;

  recordForm: FormArray | undefined;


  //'dropdown', 'id', 'value',
  displayedColumns:string[] = ['value', 'isDeleted', 'sort', 'actions', 'position'];


  dropdowns: Dropdown[] = [
    {dropdown: 'animalType', displayName: 'Animal Type', request: 'AnimalTypes'},
    {dropdown: 'callOutcomes', displayName: 'Call Outcomes', request: 'CallOutcomes'},
    {dropdown: 'emergencyCodes', displayName: 'Emergency codes', request: 'EmergencyCodes'},
    {dropdown: 'patientStates', displayName: 'Patient States', request: 'PatientStates'},
    {dropdown: 'callTypes', displayName: 'Call Types', request: 'CallTypes'},
    {dropdown: 'surgerySite', displayName: 'Surgery Site', request: 'SurgerySite'},
    {dropdown: 'surgeryType', displayName: 'Surgery Type', request: 'SurgeryType'},
    {dropdown: 'patientCallerInteractionOutcomes', displayName: 'Patient Caller Interaction Outcomes', request: 'PatientCallerInteractionOutcomes'},
    {dropdown: 'getStreetTreatMainProblem', displayName: 'StreetTreat Main Problem', request: 'GetStreetTreatMainProblem'},
    {dropdown: 'getTreatmentAreas', displayName: 'Treatment Areas', request: 'GetTreatmentAreas'},
    {dropdown: 'problem', displayName: 'Problem', request: 'Problems'}
  ];

  dropdownForm: FormGroup;

  currentDropdown: string | undefined;
  currentDisplayName: string | undefined;

  currentDropdownDataSource = new BehaviorSubject<AbstractControl[]>([]);
  rows!:FormArray;

  get formArrayControlNames(){

    return Object.keys((this.recordForm as FormArray)?.controls[0].value);
  }

  get textFormControlName() {
   return this.formArrayControlNames[1];
  }

  get dropDownElement(){
    return {
      ...(this.recordForm as FormArray)?.controls[0]?.value,
      [this.formArrayControlNames[0]]:0,
      [this.formArrayControlNames[1]]:'', isDeleted: 0,
      sort: 0,
      isEditable: false
    };
  }



  constructor(
    private fb: FormBuilder,
    private changeDetector: ChangeDetectorRef,
    private dropdownService: DropdownService
) {

  this.dropdownForm = this.fb.group({
    currentDropdown: ''
  });


  this.recordForm = this.fb.array([
    this.fb.group({
      id: [],
      value: '',
      isDeleted: false,
      sort: []
    })
  ])


}

  ngOnInit(): void {


    this.dropdownForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(dropdown =>
      {

        if(!dropdown){
          return;
        }

        const drop:Dropdown = dropdown.currentDropdown;

        this.currentDropdown = drop.dropdown;
        this.currentDisplayName = drop.displayName;

        this.recordForm = this.fb.array([
          this.fb.group({
            dropdown: this.currentDisplayName,
            id: [],
            value: '',
            isDeleted: false,
            sort: []
          })
        ]);



        this.generateDropDownForOrganisation(this.dropdownService.getDynamicDropdown(drop.request)).subscribe(
          dropdownResult => {
              this.recordForm = this.generateDropDownFormArray(
                dropdownResult.map(result => {

                    const vals = Object.values(result);

                      return this.fb.group({
                          id: vals[0],
                          value: vals[1],
                          isDeleted: vals[2],
                          sort: vals[3]
                      })
                    }
                  )
              );

              this.currentDropdownDataSource.next((this.recordForm as FormArray).controls);
              this.rows = (this.recordForm as FormArray);

              this.table.renderRows();
              this.changeDetector.detectChanges();

              }

        );

    });

  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
}

applyFilter(filterValue: string) {

  filterValue = filterValue.trim().toLowerCase();

  this.currentDropdownDataSource.next(filterValue === '' ?
                                            this.rows.controls :
                                            this.rows.controls.filter(el => el.get(this.textFormControlName)?.value.toLowerCase().indexOf(filterValue) > -1));

}


addData($event:Event) {

  $event.preventDefault();
  this.rows.push( this.fb.group(this.dropDownElement));
  this.table.renderRows();

}

dropTable(event: CdkDragDrop<AbstractControl[], any>) {

  this.currentDropdownDataSource.pipe(takeUntil(this.ngUnsubscribe)).subscribe(dataSource =>{

    const prevIndex =  dataSource.findIndex((d) => d === event.item.data);

    dataSource[prevIndex].get('sortOrder')?.setValue(event.currentIndex + 1);

    dataSource[event.currentIndex].get('sortOrder')?.setValue(prevIndex + 1);


    moveItemInArray(dataSource, prevIndex, event.currentIndex);

    dataSource.sort((a:AbstractControl, b:AbstractControl) =>  a.get('sortOrder')?.value - b.get('sortOrder')?.value);

    this.table.renderRows();

  });

}

generateDropDownForOrganisation(observable:Observable<any[]>){

  return observable.pipe(
      map(values => values.map((value: any) => ({...value, Editable: false})) ),
      map(values => values.sort((a:any,b:any) => a.Sort - b.Sort)),
  );
}

generateDropDownFormArray(values:FormGroup[]){

  const dropDownFormArray = new FormArray(values);

  dropDownFormArray.setValidators([UniqueValidators.uniqueBy('sort')]);
  dropDownFormArray.disable();

  return dropDownFormArray;

}

removeData($event:Event,index:number) {

  $event.preventDefault();

  if (index > -1) {

    this.rows.removeAt(index);

    this.currentDropdownDataSource.next(this.rows.controls);
  }


}

updateAble(index:number, $event:MatCheckboxChange){

  this.rows.at(index).get('isDeleted')?.setValue( $event.checked ? 1 : 0);

}

editRow(index:number, $event:Event){

$event.preventDefault();

this.rows.at(index).enable({onlySelf:true});

}

saveRow(index:number, $event:Event){

  $event.preventDefault();

  this.rows.at(index).disable({onlySelf:true});

}

}
