import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SurgeryRecord, UpdatedSurgery } from 'src/app/core/models/surgery-details';
import { FormBuilder, FormGroup } from '@angular/forms';

export interface DialogData {
    patientId: number;
    tagNumber: string;
    emergencyNumber: number;
    animalType: string;
}

interface CanExitChange {
    surgeryDetailsSaveComplete: number;
}
@Component({
    selector: 'app-add-surgery-dialog',
    templateUrl: './add-surgery-dialog.component.html',
    styleUrls: ['./add-surgery-dialog.component.scss'],
})
export class AddSurgeryDialogComponent implements OnInit {

    result: UpdatedSurgery;
    canExit: FormGroup;
    invalidSurgeryForm: boolean;

    constructor(
        public dialogRef: MatDialogRef<AddSurgeryDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private fb: FormBuilder,
    ) {}

    ngOnInit() {

        this.canExit = this.fb.group({
            surgeryDetailsSaveComplete: [0],
        });

        this.canExit.valueChanges.subscribe((values: CanExitChange) => {
            // TODO update this to handle any errors and display them to a toast.
            if (values.surgeryDetailsSaveComplete != 0) {
                this.dialogRef.close(this.result);
            }
        });
    }

    onCancel(): void {
        this.dialogRef.close(this.result);
    }

    onSurgerySaveResult(result: SurgeryRecord) {

        this.result = result;

        if (this.result) {
            this.canExit.get('surgeryDetailsSaveComplete').setValue(1);
        }
    }

    onSurgeryInvalid(invalid: boolean) {
        this.invalidSurgeryForm = invalid;
    }
}
