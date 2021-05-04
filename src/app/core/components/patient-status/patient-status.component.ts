import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { CrossFieldErrorMatcher } from '../../validators/cross-field-error-matcher';
import { DropdownService } from '../../services/dropdown/dropdown.service';
import { DatePipe } from '@angular/common';
import { UserOptionsService } from '../../services/user-option/user-options.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Patient } from '../../models/patients';
import { getCurrentTimeString } from '../../helpers/utils';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { PatientStatusResponse } from '../../models/responses';
import { Observable } from 'rxjs';
import { PatientService } from '../../services/patient/patient.service';
import { take } from 'rxjs/operators';


@Component({
    selector: 'patient-status',
    templateUrl: './patient-status.component.html',
    styleUrls: ['./patient-status.component.scss'],
})
export class PatientStatusComponent implements OnInit {

    @Input() patientId!: number;
    @Output() formInvalid: EventEmitter<boolean> = new EventEmitter();

    currentTime = '';
    createdDate = '';
    errorMatcher = new CrossFieldErrorMatcher();

    notificationDurationSeconds = 3;
    patientStates$!:Observable<PatientStatusResponse[]>;
    patientStatusForm!:FormGroup;
    tagNumber:string | undefined;

    constructor(
        private dropdowns: DropdownService,
        private datepipe: DatePipe,
        private patientService: PatientService,
        private userOptions: UserOptionsService,
        private fb: FormBuilder,
        private showSnackBar: SnackbarService,
    ) {

        this.patientStates$ = this.dropdowns.getPatientStates();
    }

    ngOnInit() {

        this.notificationDurationSeconds = this.userOptions.getNotifactionDuration();

        this.patientStatusForm = this.fb.group({
            patientId: [this.patientId, Validators.required],
            tagNumber: [],
            createdDate: [, Validators.required],
            patientStatusId: [, Validators.required],
            patientStatusDate: [, Validators.required],
            PN: [],
            suspectedRabies: [false],
        });

        this.patientService
            .getPatientByPatientId(
                this.patientStatusForm.get('patientId')?.value,
            )
            .pipe(take(1))
            .subscribe((patient: Patient) => {
                this.patientStatusForm.patchValue(patient);
                this.tagNumber = this.patientStatusForm.get('tagNumber')?.value;
                this.createdDate = this.patientStatusForm.get('createdDate')?.value;
            });

        this.currentTime = getCurrentTimeString();

        this.patientStatusForm.valueChanges.subscribe(() => {

            this.formInvalid.emit(this.patientStatusForm.invalid);
        } );

    }

    onSave() {

        this.patientService
            .updatePatientStatus(this.patientStatusForm.value)
            .then(result => {
                // Add this to the messaging service

                result.success === 1
                    ? this.showSnackBar.successSnackBar(
                          'Patient status updated successfully',
                          'OK',
                      )
                    : this.showSnackBar.errorSnackBar(
                          'Error updating patient status',
                          'OK',
                      );
            });
    }

    onStatusChange() {
        // Empty out the values associated with a deceased patient if the patient hasn't died
        // TODO - Check that the state on the line below will work for all organisations
        if (this.patientStatusForm.get('patientStatusId')?.value !== 3) {
            this.patientStatusForm.get('PN')?.setValue(null);
            this.patientStatusForm.get('suspectedRabies')?.setValue(null);
        }
    }

    setDate() {
        const date = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
        this.patientStatusForm.get('patientStatusDate')?.setValue(date);
    }
}
