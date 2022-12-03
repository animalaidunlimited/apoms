import { Component, OnInit, Inject } from '@angular/core';
import { UpdatedRescue } from 'src/app/core/models/outstanding-case';
import { UntypedFormBuilder } from '@angular/forms';
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
    result: UpdatedRescue | undefined;

    constructor(
        private fb: UntypedFormBuilder,
        public MatDialogRef: MatDialogRef<PatientCallDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
    ) {}

    ngOnInit() {}

    onCancel(): void {
        this.MatDialogRef.close(this.result);
    }

    onResult($event:any) {
        this.MatDialogRef.close($event);
    }
}
