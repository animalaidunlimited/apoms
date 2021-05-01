import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { take, reduce, takeUntil, map } from 'rxjs/operators';
import { getCurrentDateString } from 'src/app/core/helpers/utils';
import { TreatmentArea, TreatmentListPrintObject } from 'src/app/core/models/treatment-lists';
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
  treatmentAreas:Observable<TreatmentArea[]>;
  currentArea:TreatmentArea = {areaId: 0, areaName: ''};

  isPrinting: BehaviorSubject<boolean>;

  selectedDate: string | Date = getCurrentDateString();

  constructor(
    private dropdown: DropdownService,
    private printService: PrintTemplateService,
    private fb: FormBuilder) {

    this.isPrinting = this.printService.getIsPrinting();

    this.treatmentAreas = this.dropdown.getTreatmentAreas()
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

  }

}

