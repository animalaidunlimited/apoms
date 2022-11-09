import { Component, Inject, Input } from '@angular/core';
import { UntypedFormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
    patientId: number;
    tagNumber: string;
    patientStatusId: number;
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
        private fb: UntypedFormBuilder
    ) {

        this.patientId = this.data.patientId;

        if(!this.patientStatusForm){

            this.patientStatusForm = this.fb.group({
                patientId: this.patientId,
                patientStatusId: null,
                patientStatus: null
            });

        }



    }

    onCancel(): void {
        this.dialogRef.close();
    }

    setFormValidity($event:boolean){
        this.formInvalid = $event;
    }

    setPatientStatus($event:any){

        this.patientStatusForm.get('patientStatusId')?.setValue($event.patientStatusId);
        this.patientStatusForm.get('patientStatus')?.setValue($event.patientStatus);
    }


}
