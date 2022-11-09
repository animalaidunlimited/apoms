import { DatePipe } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { MatChip, MatChipList } from '@angular/material/chips';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TreatmentListService } from 'src/app/modules/treatment-list/services/treatment-list.service';
import { getCurrentTimeString } from '../../helpers/utils';
import { TreatmentRecord, TreatmentResponse } from '../../models/treatment';
import { DropdownService } from '../../services/dropdown/dropdown.service';
import { SnackbarService } from '../../services/snackbar/snackbar.service';
import { TreatmentService } from '../../services/treatment/treatment.service';
import { ConfirmationDialog } from '../confirm-dialog/confirmation-dialog.component';

interface DialogData{
  patientId : number;
  treatmentId: number;
  }

@Component({
  selector: 'app-treatment-record',
  templateUrl: './treatment-record.component.html',
  styleUrls: ['./treatment-record.component.scss']
})

export class TreatmentRecordComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  @ViewChild('edChips', { static: true }) edChips!: MatChipList;
  @ViewChild('ndChips', { static: true }) ndChips!: MatChipList;

  currentTime = getCurrentTimeString();

  eyeDischarge = this.dropdown.getEyeDischarge();
  nasalDischarge = this.dropdown.getNasalDischarge();

  treatmentDetails = this.fb.group({
    treatmentId: [],
    patientId: [this.data.patientId, Validators.required],
    treatmentDateTime: [, Validators.required],
    nextTreatmentDateTime: [],
    eyeDischarge: [],
    nasalDischarge: [],
    comment: [],
    isDeleted: false
  });

  constructor(
    private fb: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private snackbar: SnackbarService,
    public dialog: MatDialog,
    private dialogRef:MatDialogRef<TreatmentRecordComponent>,
    private treatmentService: TreatmentService,
    private treatmentListService: TreatmentListService,
    private dropdown: DropdownService,
    private datepipe: DatePipe
  ) { }




  ngOnInit(): void {

    this.initialiseTreatmentDetails();

  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  async initialiseTreatmentDetails(){

    const date = this.datepipe.transform(new Date(), 'yyyy-MM-ddTHH:mm:ss');

    if(!date){
      throw Error('Unable to create date');
    }

    if(this.data.treatmentId !== -1){

      // We may be opening from the treatment list or from the patient record, so handle both.
      const treatmentDetails:TreatmentRecord = this.data.treatmentId !== 0 ?
        await this.treatmentService.getTreatmentByTreatmentId(this.data.treatmentId) :
        await this.treatmentService.getLastTreatmentByDate(this.data.patientId, date);

      this.treatmentDetails.patchValue(treatmentDetails);

      const edValue = this.eyeDischarge.find(elem => elem.key === treatmentDetails.eyeDischarge);
      const ndValue = this.nasalDischarge.find(elem => elem.key === treatmentDetails.nasalDischarge);

      this.edChips.chips.find(chip => chip.value.trim() === edValue?.value)?.select();
      this.ndChips.chips.find(chip => chip.value.trim() === ndValue?.value)?.select();

    }

  }

  setInitialTime(event: FocusEvent) {

    let currentTime;
    currentTime = this.treatmentDetails.get((event.target as HTMLInputElement).name)?.value;

    if (!currentTime) {
        this.treatmentDetails.get((event.target as HTMLInputElement).name)?.setValue(getCurrentTimeString());
    }
}

edChipSelected(chip: MatChip){

  if(chip.selected){

      const eyeDischarge = this.eyeDischarge.find(elem => elem.value === chip.value.trim());

      this.treatmentDetails.get('eyeDischarge')?.setValue(eyeDischarge?.key);
  }

}

ndChipSelected(chip: MatChip){

  if(chip.selected){

    const nasalDischarge = this.nasalDischarge.find(elem => elem.value === chip.value.trim());

    this.treatmentDetails.get('nasalDischarge')?.setValue(nasalDischarge?.key);
  }

}

deleteTreatment(){

  const dialogRef = this.dialog.open(ConfirmationDialog,{
    data:{
      message: 'Are you sure want to delete this treatment?',
      buttonText: {
        ok: 'Yes',
        cancel: 'No'
      }
    }
  });

  dialogRef.afterClosed()
  .pipe(takeUntil(this.ngUnsubscribe))
  .subscribe((confirmed: boolean) => {

    if (confirmed) {
      this.treatmentDetails.get('isDeleted')?.setValue(true);

      this.treatmentListService.updateTreatedToday(this.data.patientId, false);

      this.saveTreatment(false);
    }
  });

}

saveTreatment(treated: boolean){

  this.treatmentDetails.get('treatedToday')?.setValue(treated);

  this.treatmentListService.updateTreatedToday(this.data.patientId, treated);

  this.treatmentService.saveTreatment(this.treatmentDetails.value).then((result:TreatmentResponse) => {

    result.success === 1 ?
      (
        this.treatmentDetails.get('treatmentId')?.setValue(result.treatmentId),
        this.snackbar.successSnackBar('Treatment saved successfully', 'OK'),
        this.dialogRef.close(this.treatmentDetails.value)
       ) :
      this.snackbar.errorSnackBar('An error occured when saving treatment', 'OK');

  });

}

}
