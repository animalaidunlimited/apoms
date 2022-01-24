import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Injectable, NgZone } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { EditableDropdownElement } from 'src/app/core/models/dropdown';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { UniqueValidators } from 'src/app/core/validators/unique-validators';


@Injectable({
  providedIn: 'root'
})
export class EditableDropdownService {

  currentTable: string | undefined;

  editableDropdownForm:FormArray;
  filteredEditableDropdownForm:FormArray;

  editableDropdownObject: BehaviorSubject<AbstractControl[]>;

  refreshing = new BehaviorSubject<boolean>(false);

  get formArrayControlNames(){

    return Object.keys((this.editableDropdownForm as FormArray)?.controls[0].value);
  }

  get textFormControlName() {
   return this.formArrayControlNames[1];
  }

  constructor(
    private zone: NgZone,
    private fb: FormBuilder,
    private snackbar: SnackbarService,
    private dropdownService: DropdownService
  ) {

    this.editableDropdownForm = this.getEmptyEditableDropdownForm();
    this.filteredEditableDropdownForm = this.editableDropdownForm;

    this.editableDropdownObject = new BehaviorSubject<AbstractControl[]>(this.editableDropdownForm.controls);

  }

  setEditableDropdown(currentDropdownTable: string) : void {

    this.currentTable = currentDropdownTable;
    this.refreshing.next(true);

  }

  repopulateDropDownFormArray(dropdownData: any[]) {

    this.editableDropdownForm = this.generateDropDownFormArray(
      dropdownData.map(result => {

            const vals = Object.values(result);

            return this.getEmptyElement(
                          vals[0] as number,
                          vals[1] as string,
                          vals[2] as boolean,
                          vals[3] as number,
                          false);
          }
        )
    );

    this.emit();

  }


  getEmptyEditableDropdownForm() : FormArray {

    return this.fb.array([this.getEmptyElement(undefined, undefined, false, undefined, false)]);

  }

  getEmptyElement(id? : number, value? : string, isDeleted? : boolean, sort? : number, saving?: boolean) : FormGroup {

    return this.fb.group({
      id: [id],
      value: [value, Validators.required],
      isDeleted: isDeleted,
      sort: [sort, Validators.required],
      saving: saving
    });

  }

  addRow() : void {

    this.editableDropdownForm.controls.unshift(this.getEmptyElement());

    this.emit();

  }

  private emit() {

    this.zone.run(() => this.editableDropdownObject.next(this.editableDropdownForm.controls));
    this.zone.run(() => this.refreshing.next(false));
  }

  generateDropDownFormArray(values:FormGroup[]){

    const dropDownFormArray = new FormArray(values);

    dropDownFormArray.setValidators([UniqueValidators.uniqueBy('sort')]);
    dropDownFormArray.disable();

    return dropDownFormArray;

  }

  changeOrder(event: CdkDragDrop<AbstractControl[], any>){

    const prevIndex =  this.editableDropdownForm.controls.findIndex((d) => d === event.item.data);

    moveItemInArray(this.editableDropdownForm.controls, prevIndex, event.currentIndex);

    //Update the sort value and save the value to the database.
    this.editableDropdownForm.controls.forEach((element, index) => {

      const currentIndex = element.get('sort');

      //We only need to make a call to the DB if the sort has changed.
      if(currentIndex?.value !== index + 1){

        element.get('sort')?.setValue(index + 1);
        this.saveDropdownElement(element);

      }

    });

    this.emit();

  }

  saveDropdownElement(dropdownElement: AbstractControl) : void {

    if(!this.currentTable){
      return;
    }

    dropdownElement.get('saving')?.setValue(true);

    const updatedElement = dropdownElement.value as EditableDropdownElement;

    this.dropdownService.saveEditableDropdownElement(this.currentTable, updatedElement).then(result => {

      dropdownElement.get('saving')?.setValue(false);

      if(result?.error){
        this.snackbar.errorSnackBar('A server error has occured: error EDS-156', 'OK');
      }
      else {
        this.emit();
      }



    });


  }

  removeElement(index: number) : void{

    //We need to set these to deleted.
    this.editableDropdownForm.at(index).get('isDeleted')?.setValue(1);
    this.emit();

  }

  setUpdatable(index: number, updatable: number) : void{

    this.editableDropdownForm.at(index).get('isDeleted')?.setValue(updatable);
    this.emit();

  }

  setEditable(index: number) : void {

    this.editableDropdownForm.at(index).enable({onlySelf:true});
    this.emit();

  }

  saveRow(index: number) : void {

    let saveElement = this.editableDropdownForm.at(index)

    saveElement.disable({onlySelf:true});
    this.saveDropdownElement(saveElement);

  }

  filterData(filterValue: string) : void {

    this.filteredEditableDropdownForm.controls = this.editableDropdownForm.controls
                                                  .filter(el => filterValue === '' || el.get(this.textFormControlName)?.value.toLowerCase().indexOf(filterValue) > -1);

    this.zone.run(() => this.editableDropdownObject.next(this.filteredEditableDropdownForm.controls));

    //this.editableDropdownForm = filterValue === '' ?
    //this.rows.controls :
    //this.rows.controls.filter(el => el.get(this.textFormControlName)?.value.toLowerCase().indexOf(filterValue) > -1));

  }



}
