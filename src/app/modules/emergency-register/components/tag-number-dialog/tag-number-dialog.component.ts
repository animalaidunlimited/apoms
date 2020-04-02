import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { UniqueTagNumberValidator } from 'src/app/core/validators/tag-number.validator';
import { FormBuilder } from '@angular/forms';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';

export interface DialogData {
  tagNumber: string;
  emergencyCaseId: number;
  patientId: number;
  duplicate: boolean;
}

@Component({
  selector: 'tag-number-dialog',
  templateUrl: './tag-number-dialog.component.html',
  styleUrls: ['./tag-number-dialog.component.scss']
})

export class TagNumberDialog implements OnInit{

  errorMatcher = new CrossFieldErrorMatcher();

  constructor(
    public dialogRef: MatDialogRef<TagNumberDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder,
    private uniqueTagNumberValidator: UniqueTagNumberValidator) {}

    tagForm;

    ngOnInit()
{

  this.tagForm = this.fb.group({
    tagNumber: [this.data.tagNumber,,
        this.uniqueTagNumberValidator.validate(this.data.emergencyCaseId, this.data.patientId)]
  });

}

  onCancel(): void {
    this.dialogRef.close();
  }

}
