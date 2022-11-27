import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectorRef, Component,  OnDestroy,  OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { MatLegacyCheckboxChange as MatCheckboxChange } from '@angular/material/legacy-checkbox';
import { MatLegacyTable as MatTable } from '@angular/material/legacy-table';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { EditableDropdown } from 'src/app/core/models/dropdown';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { EditableDropdownService } from '../../../core/services/editable-dropdown/editable-dropdown.service';


 @Component({
  selector: 'aau-organisation-dropdown',
  templateUrl: './organisation-dropdown.component.html',
  styleUrls: ['./organisation-dropdown.component.scss']
})

export class OrganisationDropdownComponent implements OnInit, OnDestroy {
  
  private ngUnsubscribe = new Subject();

  @ViewChild(MatTable) table!: MatTable<Element>;

  currentDropdownValue: string | undefined;
  currentDisplayName: string | undefined;

  currentDropdownDataSource: BehaviorSubject<AbstractControl[]>;

  displayedColumns:string[] = ['value', 'isDeleted', 'sort', 'saving'];

  dropdowns: Observable<EditableDropdown[]> | undefined;

  
  
  dropdownForm = this.fb.nonNullable.group({
    currentDropdown: [this.generateEmptyEditableDropdown()]
  });

  refreshing: BehaviorSubject<boolean>;

  constructor(
    private fb: UntypedFormBuilder,
    private changeDetector: ChangeDetectorRef,
    private dropdownService: DropdownService,
    private eDropdownService: EditableDropdownService
) {

  this.currentDropdownDataSource = this.eDropdownService.editableDropdownObject;
  this.refreshing = this.eDropdownService.refreshing;


}

  ngOnInit(): void {

    this.dropdowns = this.dropdownService.getEditableDropdowns();

    this.dropdownForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(dropdown =>
      {

        if(!dropdown){
          return;
        }

        const drop:EditableDropdown = dropdown.currentDropdown || this.generateEmptyEditableDropdown();

        this.currentDropdownValue = drop.dropdown;
        this.currentDisplayName = drop.displayName;

        this.eDropdownService.setEditableDropdown(drop.tableName);

        let dropData = this.dropdownService.getDynamicDropdown(drop.request);

        this.generateDropDownForOrganisation(dropData)
                    .pipe(takeUntil(this.ngUnsubscribe))
                    .subscribe(dropdownResult => this.eDropdownService.repopulateDropDownFormArray(dropdownResult));
      });

      this.currentDropdownDataSource.subscribe(() => {

        this.changeDetector.detectChanges();
    });

  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
}

generateEmptyEditableDropdown() : EditableDropdown {
  return {
    dropdown: '',
    displayName: '',
    request: '',
    tableName: ''
  };
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
