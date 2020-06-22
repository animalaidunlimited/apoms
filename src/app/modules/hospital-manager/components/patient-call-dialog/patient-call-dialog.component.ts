import { Component, OnInit, Inject } from '@angular/core';
import { UpdatedRescue } from 'src/app/core/models/outstanding-case';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
    patientId: number;
    tagNumber: string;
}

@Component({
    selector: 'patient-call-dialog',
    templateUrl: './patient-call-dialog.component.html',
    styleUrls: ['./patient-call-dialog.component.scss'],
})
export class PatientCallDialogComponent implements OnInit {
    result: UpdatedRescue;

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<PatientCallDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
    ) {}

    ngOnInit() {}

    onCancel(): void {
        this.dialogRef.close(this.result);
    }

    onResult($event) {
        this.dialogRef.close($event);
    }
}
