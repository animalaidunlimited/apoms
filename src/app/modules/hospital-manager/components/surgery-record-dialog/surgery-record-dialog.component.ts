import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntypedFormBuilder, FormGroup } from '@angular/forms';
import { UpdatedSurgery } from 'src/app/core/models/surgery-details';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

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

    result: UpdatedSurgery | undefined;
    canExit: FormGroup;
    private ngUnsubscribe = new Subject();

    constructor(
        public dialogRef: MatDialogRef<SurgeryRecordDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private fb: UntypedFormBuilder,
    ) {


        this.canExit = this.fb.group({
            surgeryDetailsUpdateComplete: [0],
        });

    }

    ngOnInit() {


        this.canExit.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((values: CanExitChange) => {
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

            const canExitControl = this.canExit.get('surgeryDetailsUpdateComplete');

            if(canExitControl){
                canExitControl.setValue(1);
            }
            else {
                throw new Error('surgeryDetailsUpdateComplete is empty');

            }

        }
    }
}
