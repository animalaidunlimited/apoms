import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component,  Input,  OnDestroy,  OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatTable } from '@angular/material/table';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { UniqueValidators } from 'src/app/core/components/patient-visit-details/unique-validators';
import { DropdownService, EditableDropdown } from 'src/app/core/services/dropdown/dropdown.service';
import { EditableDropdownService } from '../../services/editable-dropdown.service';


 @Component({
  selector: 'aau-organisation-dropdown',
  templateUrl: './organisation-dropdown.component.html',
  styleUrls: ['./organisation-dropdown.component.scss']
})

export class OrganisationDropdownComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();



  @ViewChild(MatTable) table!: MatTable<Element>;

  currentDropdown: string | undefined;
  currentDisplayName: string | undefined;

  currentDropdownDataSource: BehaviorSubject<AbstractControl[]>;

  displayedColumns:string[] = ['value', 'isDeleted', 'sort', 'actions', 'position'];

  dropdowns: Observable<EditableDropdown[]> | undefined;
  dropdownForm: FormGroup;



  //recordForm: FormArray | undefined;
  //rows!:FormArray;

  refreshing: BehaviorSubject<boolean>;

  //get formArrayControlNames(){

  //  return Object.keys((this.recordForm as FormArray)?.controls[0].value);
  //}

  //get textFormControlName() {
  // return this.formArrayControlNames[1];
  //}


  constructor(
    private fb: FormBuilder,
    private changeDetector: ChangeDetectorRef,
    private dropdownService: DropdownService,
    private eDropdownService: EditableDropdownService
) {

  this.currentDropdownDataSource = this.eDropdownService.editableDropdownObject;
  this.refreshing = this.eDropdownService.refreshing;

  this.dropdownForm = this.fb.group({
    currentDropdown: ''
  });




}

  ngOnInit(): void {

    this.dropdowns = this.dropdownService.getEditableDropdowns();

    this.dropdownForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(dropdown =>
      {

        if(!dropdown){
          return;
        }

        const drop:EditableDropdown = dropdown.currentDropdown;

        this.currentDropdown = drop.dropdown;
        this.currentDisplayName = drop.displayName;

        this.eDropdownService.populateEditableDropdownForm(this.currentDisplayName);

        let dropData = this.dropdownService.getDynamicDropdown(drop.request);

        this.generateDropDownForOrganisation(dropData).subscribe(dropdownResult => this.eDropdownService.repopulateDropDownFormArray(dropdownResult));
      });

      this.currentDropdownDataSource.subscribe((vals) => {

        this.changeDetector.detectChanges();
    });

  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
}

applyFilter(filterValue: string) {

  filterValue = filterValue.trim().toLowerCase();

  this.eDropdownService.filterData(filterValue);

}

addData($event:Event) {

  $event.preventDefault();
  this.eDropdownService.addRow();

}

dropTable(event: CdkDragDrop<AbstractControl[], any>) {

  this.eDropdownService.changeOrder(event);

}

generateDropDownForOrganisation(observable:Observable<any[]>){

  return observable.pipe(
      map(values => values.map((value: any) => ({...value, Editable: false})) ),
      map(values => values.sort((a:any,b:any) => a.Sort - b.Sort)),
  );
}

removeData($event:Event,index:number) {

  $event.preventDefault();

  if (index > -1) {

    this.eDropdownService.removeElement(index);
  }


}

setUpdatable(index:number, $event:MatCheckboxChange){

  let checked = $event.checked ? 1 : 0

  this.eDropdownService.setUpdatable(index, checked);

}

editRow(index:number, $event:Event){

$event.preventDefault();

this.eDropdownService.setEditable(index);

}

saveRow(index:number, $event:Event){

  $event.preventDefault();

  this.eDropdownService.saveRow(index);

}

}
