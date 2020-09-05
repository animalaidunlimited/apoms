import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { CrossFieldErrorMatcher } from '../../../../core/validators/cross-field-error-matcher';
import { CaseService } from '../../services/case.service';
import { UserOptionsService } from 'src/app/core/services/user-options.service';
import { EmergencyResponse, PatientResponse, ProblemResponse } from 'src/app/core/models/responses';
import { getCurrentTimeString } from 'src/app/core/helpers/utils';
import { EmergencyCase } from 'src/app/core/models/emergency-record';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';

@Component({
    selector: 'emergency-record',
    templateUrl: './emergency-record.component.html',
    styleUrls: ['./emergency-record.component.scss'],
})
export class EmergencyRecordComponent implements OnInit {
    @Input() emergencyCaseId: number;
    @Output() public onLoadEmergencyNumber = new EventEmitter<any>();

    recordForm: FormGroup;

    errorMatcher = new CrossFieldErrorMatcher();

    currentTime: string;

    notificationDurationSeconds: number;

    @HostListener('document:keydown.control.shift.r', ['$event'])
    resetForm(event: KeyboardEvent) {
        event.preventDefault();
        this.recordForm.reset();
    };

    @HostListener('document:keydown.control.s', ['$event'])
    saveFormShortcut(event: KeyboardEvent) {
        event.preventDefault();
        this.saveForm();
    };

    constructor(
        private fb: FormBuilder,
        private userOptions: UserOptionsService,
        private caseService: CaseService,
        private showSnackBar: SnackbarService,
    ) {}

    ngOnInit() {
        this.notificationDurationSeconds = this.userOptions.getNotifactionDuration();

        this.recordForm = this.fb.group({
            emergencyDetails: this.fb.group({
                emergencyCaseId: [this.emergencyCaseId],
                updateTime: [''],
            }),
            callOutcome: this.fb.group({
                CallOutcome: [],
                sameAsNumber: []
            }),
        });

        if (this.emergencyCaseId) {
            this.initialiseForm();
        }

    }

    initialiseForm() {
       this.caseService.getEmergencyCaseById(this.emergencyCaseId).subscribe(result => {

            this.recordForm.patchValue(result);
        });
    }

    getCaseSaveMessage(resultBody: EmergencyResponse) {
        const result = {
            message: 'Other error - See admin\n',
            failure: 0,
        };

        // Check the record succeeded
        if (resultBody.emergencyCaseSuccess == 1) {
            result.message = 'Success';
        } else if (resultBody.emergencyCaseSuccess == 2) {
            result.message = 'Error adding the record: Duplicate record\n';
            result.failure++;
        }

        // Check the caller succeeded
        if (resultBody.callerSuccess == 1) {
            result.message += '';
        } else if (resultBody.callerSuccess == 2) {
            result.message += 'Error adding the caller: Duplicate record \n';
            result.failure++;
        } else {
            result.message += 'Other error - See admin\n';
            result.failure++;
        }

        // Check all of the patients and their problems succeeded

        // If then don't succeed, build and show an error message
        resultBody.patients.forEach((patient: PatientResponse) => {
            if (patient.success == 1) {
                result.message += '';

                const patientFormArray = this.recordForm.get(
                    'patients',
                ) as FormArray;

                patientFormArray.controls.forEach(currentPatient => {
                    if (
                        currentPatient.get('position').value == patient.position
                    ) {

                        currentPatient
                            .get('patientId')
                            .setValue(patient.patientId);

                        currentPatient
                            .get('tagNumber')
                            .setValue(patient.tagNumber);
                    }
                });
            } else {
                result.message +=
                    'Error adding the patient: ' +
                    (patient.success == 2
                        ? 'Duplicate record \n'
                        : 'Other error - See admin\n');

                result.failure++;
            }

            patient.problems.forEach((problem: ProblemResponse) => {
                if (problem.success == 1) {
                    result.message += '';
                } else if (problem.success == 2) {
                    result.message +=
                        'Error adding the patient: Duplicate record \n';
                    result.failure++;
                } else {
                    result.message +=
                        'Error adding the patient: Other error - See admin \n';
                    result.failure++;
                }
            });
        });

        console.log(this.recordForm);

        return result;
    }

    async saveForm() {

        if(this.recordForm.pending){
            // The Emergency Number check might have gotten stuck due to the connection to the DB going down. So mark it as error so the user knows to recheck it
            this.recordForm.updateValueAndValidity();

            if(this.recordForm.pending && this.recordForm.get('emergencyDetails.emergencyNumber').pending){

                this.recordForm.get('emergencyDetails.emergencyNumber').setErrors({ stuckInPending: true});
                return;
            }
        }

        if (this.recordForm.valid) {
            this.recordForm
                .get('emergencyDetails.updateTime')
                .setValue(getCurrentTimeString());

            const emergencyForm = {
                emergencyForm: this.recordForm.value,
            } as EmergencyCase;

            let messageResult = {
                failure: 0,
            };

            if (!emergencyForm.emergencyForm.emergencyDetails.emergencyCaseId) {

                await this.caseService
                    .insertCase(emergencyForm)
                    .then(data => {

                        if (data.status == 'saved') {
                            messageResult.failure = 1;
                        } else {
                            const resultBody = data as EmergencyResponse;

                            this.recordForm
                                .get('emergencyDetails.emergencyCaseId')
                                .setValue(resultBody.emergencyCaseId);
                            this.recordForm
                                .get('callerDetails.callerId')
                                .setValue(resultBody.callerId);

                            messageResult = this.getCaseSaveMessage(resultBody);
                        }

                        if (messageResult.failure == 0) {

                            this.showSnackBar.successSnackBar(
                                'Case inserted successfully',
                                'OK',
                            );
                        } else if (messageResult.failure == 1) {
                            this.showSnackBar.errorSnackBar(
                                'Case saved offline',
                                'OK',
                            );
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    });
            } else {
                await this.caseService
                    .updateCase(emergencyForm)
                    .then(data => {

                        if (data.status == 'saved') {
                            messageResult.failure = 1;
                        } else {

                            const resultBody = data as EmergencyResponse;

                            this.recordForm
                            .get('callerDetails.callerId')
                            .setValue(resultBody.callerId);

                            messageResult = this.getCaseSaveMessage(resultBody);
                        }

                        if (messageResult.failure == 0) {
                            this.showSnackBar.successSnackBar(
                                'Case updateted successfully',
                                'OK',
                            );
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
        }

    }

    emergencyNumberUpdated(emergencyNumber: number) {
        this.onLoadEmergencyNumber.emit(emergencyNumber);
    }
}
