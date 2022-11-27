import { Component, OnInit, Inject } from '@angular/core';
import { UpdatedRescue } from 'src/app/core/models/outstanding-case';
import { UntypedFormBuilder } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

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
    result: UpdatedRescue | undefined;

    constructor(
        private fb: UntypedFormBuilder,
        public dialogRef: MatDialogRef<PatientCallDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
    ) {}

    ngOnInit() {}

    onCancel(): void {
        this.dialogRef.close(this.result);
    }

    onResult($event:any) {
        this.dialogRef.close($event);
    }
}
