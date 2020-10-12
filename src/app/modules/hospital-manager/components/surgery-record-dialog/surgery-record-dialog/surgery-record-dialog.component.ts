import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UpdatedSurgery } from 'src/app/core/models/surgery-details';

export interface DialogData {
    patientId: number;
    surgeryId: number;
    animalType: string;
    tagNumber:string;
    emergencyNumber:number;
}

interface CanExitChange {
    surgeryDetailsUpdateComplete: number;
}

@Component({
    selector: 'app-surgery-record-dialog',
    templateUrl: './surgery-record-dialog.component.html',
    styleUrls: ['./surgery-record-dialog.component.scss'],
})
export class SurgeryRecordDialogComponent implements OnInit {

    result: UpdatedSurgery;
    canExit: FormGroup;

    constructor(
        public dialogRef: MatDialogRef<SurgeryRecordDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private fb: FormBuilder,
    ) {}

    ngOnInit() {
        this.canExit = this.fb.group({
            surgeryDetailsUpdateComplete: [0],
        });

        this.canExit.valueChanges.subscribe((values: CanExitChange) => {
            // TODO update this to handle any errors and display them to a toast.
            if (values.surgeryDetailsUpdateComplete !== 0) {
                this.dialogRef.close(this.result);
            }
        });
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onSurgeryDetailsResult(result: UpdatedSurgery) {

        this.result = result;
        if (result) {
            this.canExit.get('surgeryDetailsUpdateComplete').setValue(1);
        }
    }
}
