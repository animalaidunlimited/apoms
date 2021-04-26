import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { take, reduce, takeUntil, map } from 'rxjs/operators';
import { getCurrentDateString } from 'src/app/core/helpers/utils';
import { CensusArea } from 'src/app/core/models/census-details';
import { TreatmentListPrintObject } from 'src/app/core/models/treatment-lists';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { PrintTemplateService } from '../../print-templates/services/print-template.service';

@Component({
  selector: 'app-treatment-list-page',
  templateUrl: './treatment-list-page.component.html',
  styleUrls: ['./treatment-list-page.component.scss']
})
export class TreatmentListPageComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  areas:FormGroup;
  censusAreas:Observable<CensusArea[]>;
  currentArea:CensusArea = {areaId: 0, areaName: ''};

  isPrinting: BehaviorSubject<boolean>;

  selectedDate: string | Date = getCurrentDateString();

  constructor(
    private dropdown: DropdownService,
    private printService: PrintTemplateService,
    private fb: FormBuilder) {

    this.isPrinting = this.printService.getIsPrinting();

    this.censusAreas = this.dropdown.getTreatmentAreas()
                              .pipe(
                                take(1),
                                map(result => result.sort((a,b) => (a?.sortArea || 0) < (b?.sortArea || 0) ? -1 : 1)));

    this.areas = this.fb.group({
      area: '',
      date: this.selectedDate
      });


  }

  ngOnInit(): void {

    

    this.areas.get('area')?.valueChanges
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(value => this.currentArea = value);

    this.areas.get('date')?.valueChanges
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(value => this.selectedDate = value);

  }

  ngOnDestroy() : void {
    this.ngUnsubscribe.next();
  }

  print(){

    const treatmentObject: TreatmentListPrintObject = {
      area: this.currentArea,
      selectedDate: this.selectedDate
    };

    this.printService.sendTreatmentListToPrinter(JSON.stringify(treatmentObject));

    // this.dialogRef.close();

    // this.columns.subscribe(printColumns => {

    //  this.accepted
    //  .pipe(take(1))
    //  .subscribe(sortedData => {

    //    const listToPrint = sortedData.map(current => current.value as ReportPatientRecord);

    //    const printContent: CensusPrintContent = {
    //      area: this.area.areaName,
    //      displayColumns: printColumns.map(column => column.abbreviation || column.name),
    //      printList: listToPrint
    //    };

    //    console.log(printContent);

    //    this.printService.sendTreatmentListToPrinter(JSON.stringify(printContent));

    //  });
    // });
  }

}

