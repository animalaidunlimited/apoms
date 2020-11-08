import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatChip, MatChipList } from '@angular/material/chips';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { getCurrentTimeString } from '../../helpers/utils';
import { TreatmentRecord, TreatmentResponse } from '../../models/treatment';
import { DropdownService } from '../../services/dropdown/dropdown.service';
import { SnackbarService } from '../../services/snackbar/snackbar.service';
import { TreatmentService } from '../../services/treatment/treatment.service';

interface DialogData{
  patientId : number;
  treatmentId: number;
  }

@Component({
  selector: 'app-treatment-record',
  templateUrl: './treatment-record.component.html',
  styleUrls: ['./treatment-record.component.scss']
})

export class TreatmentRecordComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private snackbar: SnackbarService,
    private dialogRef:MatDialogRef<TreatmentRecordComponent>,
    private treatmentService: TreatmentService,
    private dropdown: DropdownService,
    private datepipe: DatePipe
  ) { }

  @ViewChild('edChips', { static: true }) edChips!: MatChipList;
  @ViewChild('ndChips', { static: true }) ndChips!: MatChipList;

  eyeDischarge = this.dropdown.getEyeDischarge();
  nasalDischarge = this.dropdown.getNasalDischarge();

  currentTime = getCurrentTimeString();

  treatmentDetails = this.fb.group({
    treatmentId: [],
    patientId: [this.data.patientId, Validators.required],
    treatmentDateTime: [, Validators.required],
    nextTreatmentDateTime: [],
    eyeDischarge: [],
    nasalDischarge: [],
    comment: []
  });


  ngOnInit(): void {

    this.initialiseTreatmentDetails();

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

saveTreatment(){

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
