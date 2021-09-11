import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ViewChild, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatTable } from '@angular/material/table';
import { BehaviorSubject } from 'rxjs';

/**
 * @title Table with editing
 */
 @Component({
  selector: 'aau-organisation-dropdown',
  templateUrl: './organisation-dropdown.component.html',
  styleUrls: ['./organisation-dropdown.component.scss']
})
export class OrganisationDropdownComponent implements OnInit {
  constructor(
    private fb: FormBuilder
  ){}


  _displayedColumns!:string[];
  @Input() recordForm!:FormGroup | AbstractControl;
  
  @Input() set setDisplayedColumns(displayColumn: string[]){
    this._displayedColumns = ['SortOrder', 'IsDeleted', 'actions', 'position', ...displayColumn];
  }

  get displayedColumns() {
    return this._displayedColumns;
  }
  

  @Output() updatedDropdown: EventEmitter<any[] | FormArray> = new EventEmitter();

  rows!:FormArray;

  
  dataSource = new BehaviorSubject<AbstractControl[]>([]);
 
  saveData = new FormArray([]);
  
  @ViewChild(MatTable) table!: MatTable<Element>;


  get formArrayControlNames(){
    return Object.keys((this.recordForm as FormArray).controls[0].value);
  }
  
  get textFormControlName() { 
   return this.formArrayControlNames[1];
  }

  get dropDownElement(){
    return {
      ...(this.recordForm as FormArray).controls[0]?.value, 
      [this.formArrayControlNames[0]]:0,
      [this.formArrayControlNames[1]]:'', isDeleted: 0,
      sort: 0,
      isEditable: false
    };
  }

  ngOnInit() {
    
    this.dataSource.next((this.recordForm as FormArray).controls);
    this.rows = (this.recordForm as FormArray);

    console.log(this.displayedColumns);
  }
  
  applyFilter(filterValue: string) {

    filterValue = filterValue.trim().toLowerCase(); 
  
    this.dataSource.next(filterValue === '' ? this.rows.controls: this.rows.controls.filter(el => el.get(this.textFormControlName)?.value.toLowerCase().indexOf(filterValue) > -1));
    
  }

  addData($event:Event) {

    $event.preventDefault();
    this.rows.push( this.fb.group(this.dropDownElement));
    this.table.renderRows();

  }

  removeData($event:Event,index:number) {

    $event.preventDefault();
    
    if (index > -1) {

      this.rows.removeAt(index);

      this.dataSource.next(this.rows.controls);
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

  dropTable(event: CdkDragDrop<AbstractControl[], any>) {
   
    this.dataSource.subscribe(dataSource =>{

      const prevIndex =  dataSource.findIndex((d) => d === event.item.data);
      
      dataSource[prevIndex].get('sortOrder')?.setValue(event.currentIndex + 1);
      
      dataSource[event.currentIndex].get('sortOrder')?.setValue(prevIndex + 1); 


      moveItemInArray(dataSource, prevIndex, event.currentIndex);
    
      dataSource.sort((a,b) =>  a.get('sortOrder')?.value - b.get('sortOrder')?.value);

      this.table.renderRows();
      
    });
    
  }

}





