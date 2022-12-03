import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { take, takeUntil, map } from 'rxjs/operators';
import { getCurrentDateString } from 'src/app/core/helpers/utils';
import { TreatmentArea, TreatmentListPrintObject } from 'src/app/core/models/treatment-lists';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { MessagingService } from '../../emergency-register/services/messaging.service';
import { PrintTemplateService } from '../../print-templates/services/print-template.service';
import { TreatmentListService } from '../services/treatment-list.service';

@Component({
  selector: 'app-treatment-list-page',
  templateUrl: './treatment-list-page.component.html',
  styleUrls: ['./treatment-list-page.component.scss']
})
export class TreatmentListPageComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  areas!:FormGroup;
  currentArea:TreatmentArea = {areaId: 0, areaName: ''};
  hasWritePermission = false;
  isPrinting: BehaviorSubject<boolean>;
  refreshing = false;
  selectedDate: string | Date = getCurrentDateString();
  treatmentAreas:Observable<TreatmentArea[]>;


  constructor(
    private dropdown: DropdownService,
    private treatmentListService: TreatmentListService,
    private messagingService: MessagingService,
    private changeDetector: ChangeDetectorRef,
    private route: ActivatedRoute,
    private printService: PrintTemplateService,
    private fb: UntypedFormBuilder) {

    this.areas = this.fb.group({
      area: {},
      date: this.selectedDate
    });

    this.isPrinting = this.printService.getIsPrinting();

    this.treatmentAreas = this.dropdown.getTreatmentAreas()
                              .pipe(
                                take(1),
                                map(result => result.sort((a,b) => (a?.sortArea || 0) < (b?.sortArea || 0) ? -1 : 1)));



  }

  ngOnInit(): void {

    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val=> {

      if (val.componentPermissionLevel?.value === 2) {

          this.treatmentListService.setHasPermission(true);
      }

    });

    this.messagingService.requestPermission();

    this.treatmentListService.refreshing
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(val => {
          this.refreshing = val;
          this.changeDetector.detectChanges();
        });

    this.areas.get('area')?.valueChanges
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(value => {
          this.currentArea = value;
          this.treatmentListService.setCurrentArea(this.currentArea.areaId);
        });

    this.areas.get('date')?.valueChanges
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(value => this.selectedDate = value);



  }

  ngAfterViewInit() : void {

    this.route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {

      if(this.route.snapshot.params.areaName){

        this.dropdown.getTreatmentAreas()
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(areas =>

            areas.forEach(area => {

              if(area.areaName === this.route.snapshot.params.areaName){

                  this.areas.get('area')?.setValue(area);
              }

            })
        )


      }
    });

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

  refreshTreatmentList(){

    this.treatmentListService.populateTreatmentList(this.currentArea.areaId, this.selectedDate);
    this.changeDetector.detectChanges();

  }

  compareAreas(a: TreatmentArea, b: TreatmentArea){
    return a && b
    ? a.areaId === b.areaId
    : a === b;
  }

}

