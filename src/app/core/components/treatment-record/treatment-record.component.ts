import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatChip } from '@angular/material/chips';
import { getCurrentTimeString } from '../../helpers/utils';

@Component({
  selector: 'app-treatment-record',
  templateUrl: './treatment-record.component.html',
  styleUrls: ['./treatment-record.component.scss']
})
export class TreatmentRecordComponent implements OnInit {

  constructor(
    private fb: FormBuilder
  ) { }

  eyeDischarge = [{key: 1, value: 'Nil'},{key: 2, value: 'ED'},{key: 3, value: 'ED+'},{key: 4, value: 'ED++'}];
  nasalDischarge = [{key: 1, value: 'Nil'},{key: 2, value: 'ND'},{key: 3, value: 'ND+'},{key: 4, value: 'ND++'}];
  currentTime = getCurrentTimeString();

  treatmentDetails = this.fb.group({
    treatmentDateTime: [, Validators.required],
    nextTreatmentDateTime: [],
    eyeDischarge: [],
    nasalDischarge: [],
    comment: []
  });


  ngOnInit(): void {
  }

  setInitialTime(event: FocusEvent) {

    console.log(event);

    let currentTime;
    currentTime = this.treatmentDetails.get((event.target as HTMLInputElement).name)?.value;

    if (!currentTime) {
        this.treatmentDetails.get((event.target as HTMLInputElement).name)?.setValue(getCurrentTimeString());
    }
}

edChipSelected(chip: MatChip){

  this.treatmentDetails.get('eyeDischarge')?.setValue(chip.value);

}

ndChipSelected(chip: MatChip){

  this.treatmentDetails.get('nasalDischarge')?.setValue(chip.value);

}

}
