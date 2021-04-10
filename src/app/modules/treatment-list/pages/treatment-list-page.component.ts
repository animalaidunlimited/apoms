import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { take, reduce, takeUntil, map } from 'rxjs/operators';
import { getCurrentDateString } from 'src/app/core/helpers/utils';
import { CensusArea } from 'src/app/core/models/census-details';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';

@Component({
  selector: 'app-treatment-list-page',
  templateUrl: './treatment-list-page.component.html',
  styleUrls: ['./treatment-list-page.component.scss']
})
export class TreatmentListPageComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  censusAreas:Observable<CensusArea[]>;
  areas:FormGroup;

  currentArea:CensusArea = {areaId: 0, areaName: ''};

  constructor(private dropdown: DropdownService,
    private fb: FormBuilder) {

    this.censusAreas = this.dropdown.getTreatmentListAreas()
                              .pipe(
                                take(1),
                                reduce((result:CensusArea[], current) => result.concat(...current.map(area => area.AreaList)), []),
                                map(result => result.sort((a,b) => (a?.sortArea || 0) < (b?.sortArea || 0) ? -1 : 1))

                              );

    this.areas = this.fb.group({
      area: '',
      date: getCurrentDateString()
      });


  }

  ngOnInit(): void {

    this.areas.get('area')?.valueChanges
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(value => this.currentArea = value);

  }

  ngOnDestroy() : void {
    this.ngUnsubscribe.next();
  }

}

