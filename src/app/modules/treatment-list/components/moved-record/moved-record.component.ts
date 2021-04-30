import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs/operators';
import { ConfirmationDialog } from 'src/app/core/components/confirm-dialog/confirmation-dialog.component';
import { CensusArea } from 'src/app/core/models/census-details';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';
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
    private dialog: MatDialog,
    private changeDetector: ChangeDetectorRef
  ) {

   }

  ngOnInit(): void {


    // At the moment FormArrays when passed to a child component revert to AbstractControls..
    this.movedRecordsGroup = this.movedRecordsInput as FormGroup;
    this.movedRecords = this.movedRecordsInput.get('movedList') as FormArray;
    this.listType = this.movedRecordsInput.get('listType')?.value;

    this.movedAction = this.listType === 'admissions' ? 'Admit to' : 'Move out to';

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

    const message = `Are you sure you want to reject the movement of this patient?`;

    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        message,
        buttonText: {
        ok: 'Yes',
        cancel: 'Cancel'
        }
      }
    });

    dialogRef.afterClosed()
    .pipe(take(1))
    .subscribe((confirmed: boolean) => {
    if (confirmed) {

      this.ts.acceptRejectMoveIn(currentPatient, false).then(() => {
        this.changeDetector.detectChanges();
      });

    }
    });

  }

  areaChanged(currentPatient: AbstractControl, index:number) : void {

    const message = `Are you sure you want to move out this patient?`;

    const dialogRef = this.dialog.open(ConfirmationDialog, {
      data: {
        message,
        buttonText: {
        ok: 'Yes',
        cancel: 'Cancel'
        }
      }
    });

    dialogRef.afterClosed()
    .pipe(take(1))
    .subscribe((confirmed: boolean) => {
    if (confirmed) {

      this.ts.movePatientOutOfArea(currentPatient, this.area.areaId).then((result:SuccessOnlyResponse) => {

        if(result.success === 1){
          this.movedRecords.removeAt(index);
          this.changeDetector.detectChanges();
        }


      });

    }
    else{
      currentPatient.get('Moved to')?.setValue(undefined);
    }
    });


  }


}
