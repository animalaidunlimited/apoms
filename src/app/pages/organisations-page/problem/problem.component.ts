import { Component, ViewChild, OnInit, AfterViewInit, Input } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatTable } from '@angular/material/table';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
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
  selector: 'aau-problem',
  templateUrl: './problem.component.html',
  styleUrls: ['./problem.component.scss']
})
export class ProblemComponent implements AfterViewInit {
  constructor(
    private dropDown: DropdownService,
    private fb: FormBuilder
  ){}

  @Input() recordForm!:AbstractControl | null;
  displayedColumns = ['Problem', 'SortOrder', 'IsDeleted', 'actions'];

  dataSource = new BehaviorSubject<AbstractControl[]>([]);
  rows: FormArray = this.fb.array([]);
  

  @ViewChild(MatTable) table!: MatTable<Element>;



  ngAfterViewInit() {

    this.dropDown.getAllProblems().pipe(
      map(problems => problems.map(problem => ({...problem, Editable: false})))
    ).subscribe(problems =>  {
     
      const problemsGroup: FormGroup[] = problems.map(problem =>  this.fb.group({
        problemId: problem.ProblemId,
        problem: problem.Problem,
        isDeleted: problem.IsDeleted,
        sortOrder: problem.SortOrder
      }));

      this.rows =  new FormArray(problemsGroup);

      this.rows.disable();

      this.dataSource.next(this.rows.controls);
    });
    
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
}





