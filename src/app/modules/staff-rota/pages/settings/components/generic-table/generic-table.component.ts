import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';
import { UntypedFormBuilder, FormControl, AbstractControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-generic-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss']
})
export class GenericTableComponent implements OnInit, OnChanges {

  @Input() data!: Observable<any[]>;
  @Input() dataName!: string;
  @Input() excludeColumns: string[] | undefined;

  @Output() clickedRow: EventEmitter<FormGroup> = new EventEmitter();

  dataSourceForm!:  Observable<any[]>;

  dataColumns!:Observable<string[]>;
  displayedColumns!:Observable<string[]>;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private fb: UntypedFormBuilder
  ) { }



  ngOnInit() {

    // this.displayedColumns = this.generateDisplayedColumns();
  }

  ngOnChanges(changes: SimpleChanges) : void {

    this.createForm();

    this.dataColumns = this.data.pipe(map(values => Object.keys(values[0])));

    this.displayedColumns = this.generateDisplayedColumns();
    this.changeDetector.detectChanges();

  }

  generateDisplayedColumns() : Observable<string[]> {

    return this.dataColumns.pipe(map(values => values
                                              .filter(item => !item.includes("Id"))
                                              .filter(item => !this.excludeColumns?.includes(item))));

  }

  createForm() : void {

    //Turn the incoming array into a AbstractControl[]
    this.dataSourceForm = this.data.pipe(map(dataRows => dataRows.map(row => {

      //We need to handle arrays correctly so we store the array object. Otherwise directly turning
      //and object with an array "arrayVal: ['elem1','elem2','elem3']" the FormBuilder mistakes 'elem2'
      //for the syncValidators and 'elem3' for the asyncValidators
      Object.entries(row).forEach((element) => {

          if(typeof element === "object" && element?.length > 0){

              row[element[0]] = [element[1],];
          }

      });
      
      return this.fb.group(row)})));

  }

  emitRow(row: FormGroup) : void {
    this.clickedRow.emit(row);
  }

}
