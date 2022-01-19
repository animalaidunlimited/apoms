import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Injectable, NgZone } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { UniqueValidators } from 'src/app/core/components/patient-visit-details/unique-validators';


@Injectable({
  providedIn: 'root'
})
export class EditableDropdownService {

  editableDropdownForm:FormArray;

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
    private fb: FormBuilder
  ) {

    this.editableDropdownForm = this.getEmptyEditableDropdownForm();

    this.editableDropdownObject = new BehaviorSubject<AbstractControl[]>(this.editableDropdownForm.controls);

  }

  populateEditableDropdownForm(currentDisplayName: string) : void {

    this.refreshing.next(true);

  }

  repopulateDropDownFormArray(dropdownData: any[]) {

    this.editableDropdownForm = this.generateDropDownFormArray(
      dropdownData.map(result => {

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

    this.emit();

  }


  getEmptyEditableDropdownForm() : FormArray {

    return this.fb.array([this.getEmptyElement()]);

  }

  getEmptyElement() : FormGroup {

    return this.fb.group({
      id: [],
      value: '',
      isDeleted: false,
      sort: []
    });

  }

  addRow() : void {

    this.editableDropdownForm.push(this.getEmptyElement());
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

    console.log('prevIndex: ' + prevIndex);
    console.log('currentIndex: ' + event.currentIndex);

    //this.editableDropdownForm.controls[prevIndex].get('sort')?.setValue(event.currentIndex + 1);

    //this.editableDropdownForm.controls[event.currentIndex].get('sort')?.setValue(prevIndex + 1);

    moveItemInArray(this.editableDropdownForm.controls, prevIndex, event.currentIndex);

    console.log(this.editableDropdownForm.controls);

    this.editableDropdownForm.controls = this.editableDropdownForm.controls.sort((a:AbstractControl, b:AbstractControl) =>  a.get('sort')?.value - b.get('sort')?.value);

    console.log(this.editableDropdownForm.controls);

    this.emit();

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

    this.editableDropdownForm.at(index).disable({onlySelf:true});
    this.emit();

  }

  filterData(filterValue: string) : void {

    this.editableDropdownForm.controls = this.editableDropdownForm.controls
                                                  .filter(el => filterValue === '' || el.get(this.textFormControlName)?.value.toLowerCase().indexOf(filterValue) > -1);
    this.emit()

    //this.editableDropdownForm = filterValue === '' ?
    //this.rows.controls :
    //this.rows.controls.filter(el => el.get(this.textFormControlName)?.value.toLowerCase().indexOf(filterValue) > -1));

  }



}
