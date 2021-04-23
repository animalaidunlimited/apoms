import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { take } from 'rxjs/operators';
import { CensusArea, TreatmentListMoveIn } from 'src/app/core/models/census-details';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';
import { TreatmeantListObject } from 'src/app/core/models/treatment-lists';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { TreatmentListService } from '../../services/treatment-list.service';

@Component({
  selector: 'app-moved-treatment-record',
  templateUrl: './moved-record.component.html',
  styleUrls: ['./moved-record.component.scss']
})
export class MovedRecordComponent implements OnInit, OnChanges {

  @Input() movedRecordsInput!: AbstractControl;
  @Input() area!: CensusArea;


  allAreas!: CensusArea[];
  movedRecords!:FormArray;
  movedRecordsGroup!: FormGroup;
  listType = '';
  movedAction = '';

  constructor(
    private ts: TreatmentListService,
    private dropdown: DropdownService,
    private changeDetector: ChangeDetectorRef
  ) {

   }

  ngOnInit(): void {


    // At the moment FormArrays when passed to a child component revert to AbstractControls..
    this.movedRecordsGroup = this.movedRecordsInput as FormGroup;
    this.movedRecords = this.movedRecordsInput.get('movedList') as FormArray;
    this.listType = this.movedRecordsInput.get('listType')?.value;

    this.movedAction = this.listType === 'admission' ? 'Admit to' : 'Move to';

    this.dropdown.getTreatmentAreas()
      .pipe(
        take(1)
      ).subscribe(areaList => {

        this.allAreas = areaList.filter(area => area.areaName !== this.area.areaName);

      });

  }

  ngOnChanges(changes:SimpleChanges){

    this.movedRecordsGroup = this.movedRecordsInput as FormGroup;
    this.movedRecords = this.movedRecordsInput.get('movedList') as FormArray;

  }

  acceptMove(currentPatient: AbstractControl) : void {

    this.ts.acceptRejectMoveIn(currentPatient, true).then(() => {
      this.changeDetector.detectChanges();
    });
  }

  rejectMove(currentPatient: AbstractControl) : void {

    this.ts.acceptRejectMoveIn(currentPatient, false).then(() => {
      this.changeDetector.detectChanges();
    });

  }

  areaChanged(currentPatient: AbstractControl, index:number) : void {

    this.ts.movePatientOutOfArea(currentPatient, this.area.areaId).then((result:SuccessOnlyResponse) => {

      if(result.success === 1){
        this.movedRecords.removeAt(index);
        this.changeDetector.detectChanges();
      }


    });
  }


}
