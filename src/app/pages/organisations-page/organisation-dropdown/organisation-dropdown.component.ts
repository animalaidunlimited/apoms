import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ViewChild, OnInit, Input } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatTable } from '@angular/material/table';
import { BehaviorSubject, Observable } from 'rxjs';
export interface Element {
  ProblemId: number;
  Problem: string;
  SortOrder: number;
  Editable : boolean;
  IsDeleted: 0|1;
}
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

  @Input() recordForm!:AbstractControl | null;
  @Input() rows$!: Observable<FormArray> ;
  
  rows!:FormArray;

  displayedColumns = ['Problem', 'SortOrder', 'IsDeleted', 'actions', 'position',];
  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  
  @ViewChild(MatTable) table!: MatTable<Element>;

  ngOnInit() {
    
    this.rows$.subscribe(data => {
      this.dataSource.next(data.controls);
      this.rows = data;
    })

  }
  
  applyFilter(filterValue: string) {

    filterValue = filterValue.trim().toLowerCase(); 
    
    this.dataSource.next(filterValue === '' ? this.rows.controls: this.rows.controls.filter(el => el.get('problem')?.value.toLowerCase().indexOf(filterValue) > -1));
    
  }

  addData($event:Event) {

    $event.preventDefault();

    this.rows.push( this.fb.group({
      problemId: 0,
      problem: '',
      isDeleted: 0,
      sortOrder: 0,
      isEditable: false
    }));

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

    this.rows.at(index).enable();

  }

  saveRow(index:number, $event:Event){

    $event.preventDefault();

    this.rows.at(index).disable();

    if(this.rows.at(index).dirty){


      const saveData = (this.recordForm?.get('problems') as FormArray)
      const fIndex = saveData?.controls.indexOf(this.rows.at(index)?.value.problemId);

      if(fIndex > -1){

        saveData.at(fIndex).setValue(this.rows.at(index));

      }else{

        saveData?.push(this.rows.at(index));

      }

    }
  }

  dropTable(event: CdkDragDrop<BehaviorSubject<AbstractControl[]>, any>) {
   
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





