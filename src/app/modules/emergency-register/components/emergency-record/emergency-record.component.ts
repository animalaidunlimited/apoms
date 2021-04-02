import { Component, OnInit, Input, Output, EventEmitter, HostListener, OnDestroy, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { CrossFieldErrorMatcher } from '../../../../core/validators/cross-field-error-matcher';
import { CaseService } from '../../services/case.service';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { EmergencyResponse, PatientResponse, ProblemResponse } from 'src/app/core/models/responses';
import { getCurrentTimeString } from 'src/app/core/helpers/utils';
import { EmergencyCase } from 'src/app/core/models/emergency-record';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';


@Component({
    // tslint:disable-next-line:component-selector
    selector: 'emergency-record',
    templateUrl: './emergency-record.component.html',
    styleUrls: ['./emergency-record.component.scss'],
})

export class EmergencyRecordComponent implements OnInit, OnDestroy {

    private ngUnsubscribe = new Subject();

    @Input() emergencyCaseId: number | undefined;
    @Input() guId!: BehaviorSubject<string>;
    @Output() public loadEmergencyNumber = new EventEmitter<any>();

    currentTime = '';
    errorMatcher = new CrossFieldErrorMatcher();

    hasComments!: boolean;
    loading = false;

    notificationDurationSeconds = 3;
    recordForm: FormGroup = new FormGroup({});
    syncedToLocalStorage = false;

    windowWidth = window.innerWidth;

    @HostListener('document:keydown.control.shift.r', ['$event'])
    resetFormEvent(event: KeyboardEvent) {

        event.preventDefault();

        const element = this.elementRef.nativeElement;

        if(element.offsetParent){
            this.resetForm();
        }
    }

    @HostListener('document:keydown.control.s', ['$event'])
    saveFormShortcut(event: KeyboardEvent) {
        event.preventDefault();

        const element = this.elementRef.nativeElement;

        if(this.recordForm.valid && element.offsetParent){
            this.saveForm();
        }
    }

    @HostListener('window:beforeunload', ['$event'])
    checkCanReload($event:BeforeUnloadEvent) {

        $event.preventDefault();

        return !this.recordForm.touched;
    }

    constructor(
        private fb: FormBuilder,
        private changeDetectorRef: ChangeDetectorRef,
        private userOptions: UserOptionsService,
        private caseService: CaseService,
        private showSnackBar: SnackbarService,
        private elementRef: ElementRef
    ) {}

    ngOnInit() {

        this.notificationDurationSeconds = this.userOptions.getNotifactionDuration();

        this.recordForm = this.fb.group({
            emergencyDetails: this.fb.group({
                guId : [this.guId.value],
                emergencyCaseId: [this.emergencyCaseId],
                updateTime: [''],
            }),
            callOutcome: this.fb.group({
                CallOutcome: [],
                sameAsNumber: []
            }),
            caseComments: [],
        });

        this.caseService.emergencyResponse
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(data=> {
            if(data.guId === this.recordForm.get('emergencyDetails.guId')?.value) {

                this.emergencyCaseId = data.emergencyCaseId;

                // TODO: Put this back in when we add auto increment of Emergency Number
                // this.recordForm.get('emergencyDetails.emergencyNumber')?.setValue(data.emergencyNumber);
                this.recordForm.get('emergencyDetails.emergencyCaseId')?.setValue(this.emergencyCaseId);


                this.syncedToLocalStorage = false;
                this.recordForm.markAsPristine();
                // this.showSnackBar.successSnackBar('Offline case saved to Database, EmNo is : ' + data.emergencyNumber , 'Ok');

            }
        });

        if (this.emergencyCaseId) {
            this.initialiseForm();
        }
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    initialiseForm() : void {

        if (!this.emergencyCaseId) {
            return;
        }

        this.caseService.getEmergencyCaseById(this.emergencyCaseId)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(result => {

            this.recordForm.patchValue(result);

            this.hasComments = this.recordForm.get('caseComments')?.value ? true : false;
        });
    }

    resetForm() {

        this.recordForm.reset();

        this.guId.next(this.caseService.generateUUID());

        this.loadEmergencyNumber.emit({emergencyNumber : 'New Case*' , GUID: this.guId.value});

        this.recordForm.get('emergencyDetails.guId')?.setValue(this.guId.value);
        this.recordForm.get('emergencyDetails.code')?.setValue({
            EmergencyCodeId: null,
            EmergencyCode: null
        });

        this.recordForm.get('emergencyDetails.callDateTime')?.setValue(getCurrentTimeString());

        this.changeDetectorRef.detectChanges();
    }

    getCaseSaveMessage(resultBody: EmergencyResponse) {

         const result = {
            message: 'Other error - See admin\n',
            failure: 0
        };

        // Check the record succeeded
        if (resultBody.emergencyCaseSuccess === 1) {
            result.message = 'Success';
        } else if (resultBody.emergencyCaseSuccess === 2) {
            result.message = 'Error adding the record: Duplicate record\n';
            result.failure = -1;

            return result;
        }

        // Check the caller succeeded

        resultBody.callerSuccess.forEach((callerResult: any) => {
            if (callerResult.callerSuccess === 1) {
                result.message += '';
            } else if (callerResult.callerSuccess === 2) {
                result.message += 'Error adding the caller: Duplicate record \n';
                result.failure++;
            } else {
                result.message += 'Other error (Caller) - See admin\n';
                result.failure++;
            }
        });

        resultBody.emergencyCallerSuccess.forEach((emergencyCallerResult: any) => {
            if (emergencyCallerResult.Success === 1) {
                result.message += '';
            } else if (emergencyCallerResult.Success === 2) {
                result.message += 'Error adding the EmergencyCaller: Duplicate record \n';
                result.failure++;
            } else {
                result.message += 'Other error (EmergencyCaller) - See admin\n';
                result.failure++;
            }
        });

        // Check all of the patients and their problems succeeded
        // If then don't succeed, build and show an error message
        resultBody.patients.forEach((patient: PatientResponse) => {
            if (patient.success === 1) {
                result.message += '';

                const patientFormArray = this.recordForm.get(
                    'patients',
                ) as FormArray;

                patientFormArray.controls.forEach(currentPatient => {
                    if (
                        currentPatient.get('position')?.value === patient.position
                    ) {

                        currentPatient.get('patientId')?.setValue(patient.patientId);

                        currentPatient.get('tagNumber')?.setValue(patient.tagNumber);
                    }
                });
            } else {
                result.message +=
                    'Error adding the patient: ' +
                    (patient.success === 2
                        ? 'Duplicate record \n'
                        : 'Other error - See admin\n');

                result.failure++;
            }

            patient.problems.forEach((problem: ProblemResponse) => {
                if (problem.success === 1) {
                    result.message += '';
                } else if (problem.success === 2) {
                    result.message +=
                        'Error adding the patient problems: Duplicate record \n';
                    result.failure++;
                } else {
                    result.message +=
                        'Error adding the patient problems: Other error - See admin \n';
                    result.failure++;
                }
            });
        });
        return result;
    }

    async saveForm() {

        console.log(this.recordForm.value);

        this.loading = true;
        if (this.recordForm.pending) {
            // The Emergency Number check might have gotten stuck due to the connection to the DB going down.
            // So mark it as error so the user knows to recheck it
            this.recordForm.updateValueAndValidity();

            if (this.recordForm.pending && this.recordForm.get('emergencyDetails.emergencyNumber')?.pending) {
                this.recordForm.get('emergencyDetails.emergencyNumber')?.setErrors({ stuckInPending: true });
                return;
            }
        }

        if (this.recordForm.valid) {
            this.recordForm.get('emergencyDetails.updateTime')?.setValue(getCurrentTimeString());

            const emergencyForm = {
                emergencyForm: this.recordForm.value,
            } as EmergencyCase;

            let messageResult = {
                failure: 0,
                message: ''
            };

            if (!emergencyForm.emergencyForm.emergencyDetails.emergencyCaseId) {

                await this.caseService
                    .insertCase(emergencyForm)
                    .then(data => {
                        if (data) {
                            this.loading = false;
                        }
                        if (data.status === 'saved') {
                            messageResult.failure = 1;
                        } else {
                            const resultBody = data as EmergencyResponse;

                            // this.recordForm.get('callerDetails.callerId')?.setValue(resultBody.callerId);

                            this.emergencyCaseId = resultBody.emergencyCaseId;

                            this.recordForm.get('emergencyDetails.emergencyCaseId')?.setValue(this.emergencyCaseId);
                            this.recordForm.get('emergencyDetails.emergencyNumber')?.setValue(resultBody.emergencyNumber);
                            messageResult = this.getCaseSaveMessage(resultBody);

                        }

                        if (messageResult.failure === 0) {
                            this.showSnackBar.successSnackBar('Case inserted successfully', 'OK');
                            this.syncedToLocalStorage = false;
                            this.recordForm.markAsPristine();
                        }
                        else if (messageResult.failure === -1) {
                            this.showSnackBar.successSnackBar('Duplicate case, please reload case', 'OK');
                        }
                        else if (messageResult.failure === 1) {
                            this.showSnackBar.errorSnackBar('Case saved offline', 'OK');
                            this.syncedToLocalStorage = true;
                            this.recordForm.markAsPristine();
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    });
            } else {
                await this.caseService
                    .updateCase(emergencyForm)
                    .then(data => {

                        if (data) {
                            this.loading = false;
                        }

                        if (data.status === 'saved') {

                            messageResult.failure = 1;

                        } else {

                            const resultBody = data as EmergencyResponse;
                            messageResult = this.getCaseSaveMessage(resultBody);
                        }

                        if (messageResult.failure === 0) {

                            this.showSnackBar.successSnackBar('Case updated successfully', 'OK');
                            this.syncedToLocalStorage = false;
                            this.recordForm.markAsPristine();
                        }
                        else if (messageResult.failure === 1) {
                            this.showSnackBar.errorSnackBar('Case updated offline.', 'OK');
                            this.syncedToLocalStorage = true;
                            this.recordForm.markAsPristine();
                        }
                        else {
                            this.showSnackBar.errorSnackBar('Unknown error, please see admin.', 'OK');
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
        }

    }

    emergencyNumberUpdated(emergencyNumber: any) {

        this.loadEmergencyNumber.emit({emergencyNumber, GUID : this.recordForm.get('emergencyDetails.guId')?.value});
    }

}