import { Component, OnInit, Input } from '@angular/core';
import { CrossFieldErrorMatcher } from '../../validators/cross-field-error-matcher';
import { DropdownService } from '../../services/dropdown/dropdown.service';
import { DatePipe } from '@angular/common';
import { PatientService } from 'src/app/modules/emergency-register/services/patient.service';
import { UserOptionsService } from '../../services/user-option/user-options.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Patient } from '../../models/patients';
import { getCurrentTimeString } from '../../helpers/utils';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';


@Component({
    selector: 'patient-status',
    templateUrl: './patient-status.component.html',
    styleUrls: ['./patient-status.component.scss'],
})
export class PatientStatusComponent implements OnInit {
    errorMatcher = new CrossFieldErrorMatcher();
    patientStates$;
    @Input() patientId!: number;

    patientStatusForm;
    currentTime;
    tagNumber:string | undefined;
    createdDate = '';

    notificationDurationSeconds;

    constructor(
        private dropdowns: DropdownService,
        private datepipe: DatePipe,
        private patientService: PatientService,
        private userOptions: UserOptionsService,
        private fb: FormBuilder,
        private showSnackBar: SnackbarService,
    ) {

        this.notificationDurationSeconds = this.userOptions.getNotifactionDuration();

        this.patientStatusForm = this.fb.group({
            patientId: [this.patientId, Validators.required],
            tagNumber: ['', Validators.required],
            createdDate: ['', Validators.required],
            patientStatusId: ['', Validators.required],
            patientStatusDate: ['', Validators.required],
            PN: [''],
            suspectedRabies: [false],
        });

        this.patientStates$ = this.dropdowns.getPatientStates();

        this.patientService
            .getPatientByPatientId(
                this.patientStatusForm.get('patientId')?.value,
            )
            .subscribe((patient: Patient) => {
                this.patientStatusForm.patchValue(patient);
                this.tagNumber = this.patientStatusForm.get('tagNumber')?.value;
                this.createdDate = this.patientStatusForm.get('createdDate')?.value;
            });

        this.currentTime = getCurrentTimeString();

    }



    ngOnInit() {

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
