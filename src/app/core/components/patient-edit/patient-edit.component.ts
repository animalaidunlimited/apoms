import { Component, OnInit, Inject, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
    patientId: number;
    tagNumber: string;
}

@Component({
    selector: 'patient-edit',
    templateUrl: './patient-edit.component.html',
    styleUrls: ['./patient-edit.component.scss']
})
export class PatientEditDialog {

    @Input() patientStatusForm!: FormGroup;

    patientId: number;

    formInvalid = true;

    constructor(
        public dialogRef: MatDialogRef<PatientEditDialog>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
    ) {

        this.patientId = this.data.patientId;

    }

    onCancel(): void {
        this.dialogRef.close();
    }

    setFormValidity($event:boolean){
        this.formInvalid = $event;
    }


}
