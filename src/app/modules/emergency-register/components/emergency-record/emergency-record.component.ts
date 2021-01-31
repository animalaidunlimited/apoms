import { Component, OnInit, Input, Output, EventEmitter, HostListener, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { CrossFieldErrorMatcher } from '../../../../core/validators/cross-field-error-matcher';
import { CaseService } from '../../services/case.service';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { EmergencyResponse, PatientResponse, ProblemResponse } from 'src/app/core/models/responses';
import { getCurrentTimeString } from 'src/app/core/helpers/utils';
import { EmergencyCase } from 'src/app/core/models/emergency-record';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'emergency-record',
    templateUrl: './emergency-record.component.html',
    styleUrls: ['./emergency-record.component.scss'],
})
export class EmergencyRecordComponent implements OnInit {
    @Input() emergencyCaseId!: number;
    @Input() guId!: string;
    @Output() public loadEmergencyNumber = new EventEmitter<any>();

    loading = false;

    recordForm: FormGroup = new FormGroup({});

    windowWidth = window.innerWidth;

    errorMatcher = new CrossFieldErrorMatcher();

    currentTime = '';

    notificationDurationSeconds = 3;

    hasComments!: boolean;


    dbSync:boolean = false;

    lsSync:boolean = false;

    @HostListener('document:keydown.control.shift.r', ['$event'])
    resetForm(event: KeyboardEvent) {

        event.preventDefault();
        this.recordForm.reset();
    }

    @HostListener('document:keydown.control.s', ['$event'])
    saveFormShortcut(event: KeyboardEvent) {
        event.preventDefault();
        this.saveForm();
    }

    @HostListener('window:beforeunload', ['$event'])
    checkCanReload($event:BeforeUnloadEvent) {
        $event.preventDefault();


        return !this.recordForm.touched;
    }

    constructor(
        private fb: FormBuilder,
        private userOptions: UserOptionsService,
        private caseService: CaseService,
        private showSnackBar: SnackbarService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {

        this.notificationDurationSeconds = this.userOptions.getNotifactionDuration();

        this.recordForm = this.fb.group({
            emergencyDetails: this.fb.group({
                guId : [this.guId],
                emergencyCaseId: [this.emergencyCaseId],
                updateTime: [''],
            }),
            callOutcome: this.fb.group({
                CallOutcome: [],
                sameAsNumber: []
            }),
            caseComments: [],
        });

        this.caseService.dbSync.subscribe((value:boolean) => 
        {
            this.dbSync = value;
        });
        this.caseService.lsSync.subscribe((value:boolean) => 
        {
            this.lsSync = value;
        });

        this.caseService.emergencyResponse.subscribe(data=> {
            if(data.guId === this.recordForm.get('emergencyDetails.guId')?.value) {
                this.recordForm.get('emergencyDetails.emergencyNumber')?.setValue(data.emergencyNumber);
                this.recordForm.get('emergencyDetails.emergencyCaseId')?.setValue(data.emergencyCaseId);
                console.log(this.recordForm.get('emergencyDetails.guId')?.value);
                this.caseService.dbSync.next(true);
                // this.showSnackBar.successSnackBar('Offline case saved to Database, EmNo is : ' + data.emergencyNumber , 'Ok');
            }
        });
     
        if (this.emergencyCaseId) {
            this.initialiseForm();
        }
    }

    initialiseForm() : void {
       this.caseService.getEmergencyCaseById(this.emergencyCaseId).subscribe(result => {

            this.recordForm.patchValue(result);

            this.hasComments = this.recordForm.get('caseComments')?.value ? true : false;
        });
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

        resultBody.callerSuccess.forEach((callerResult: any)=>{
        if (callerResult.callerSuccess === 1) {
            result.message += '';
        } else if (callerResult.callerSuccess === 2) {
            result.message += 'Error adding the caller: Duplicate record \n';
            result.failure++;
        } else {
            result.message += 'Other error - See admin\n';
            result.failure++;
        }
        });
        console.log(resultBody);

        resultBody.emergencyCallerSuccess.forEach((emergencyCallerResult: any)=>{
            if (emergencyCallerResult.Success === 1) {
                result.message += '';
            } else if (emergencyCallerResult.Success === 2) {
                result.message += 'Error adding the EmergencyCaller: Duplicate record \n';
                result.failure++;
            } else {
                result.message += 'Other error - See admin\n';
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
                        'Error adding the patient: Duplicate record \n';
                    result.failure++;
                } else {
                    result.message +=
                        'Error adding the patient: Other error - See admin \n';
                    result.failure++;
                }
            });
        });
        return result;
    }

    async saveForm() {

        this.loading = true;
        if(this.recordForm.pending){
            // The Emergency Number check might have gotten stuck due to the connection to the DB going down.
            // So mark it as error so the user knows to recheck it
            this.recordForm.updateValueAndValidity();

            if(this.recordForm.pending && this.recordForm.get('emergencyDetails.emergencyNumber')?.pending){
                this.caseService.dbSync.next(false);
                this.caseService.lsSync.next(true);
                this.recordForm.get('emergencyDetails.emergencyNumber')?.setErrors({ stuckInPending: true});
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
                        if(data) {
                            this.loading = false;
                        }
                        if (data.status === 'saved') {
                            messageResult.failure = 1;
                        } else {
                            const resultBody = data as EmergencyResponse;
                            this.recordForm.get('emergencyDetails.emergencyCaseId')?.setValue(resultBody.emergencyCaseId);

                            // this.recordForm.get('callerDetails.callerId')?.setValue(resultBody.callerId);

                            this.recordForm.get('emergencyDetails.emergencyCaseId')?.setValue(resultBody.emergencyCaseId);
                            this.recordForm.get('emergencyDetails.emergencyNumber')?.setValue(resultBody.emergencyNumber);
                            messageResult = this.getCaseSaveMessage(resultBody);

                        }

                        if (messageResult.failure === 0) {
                            this.caseService.dbSync.next(true);
                            this.caseService.lsSync.next(false);
                            this.showSnackBar.successSnackBar('Case inserted successfully','OK');
                        }
                        else if (messageResult.failure === -1) {
                            this.showSnackBar.successSnackBar('Duplicate case, please reload case','OK');
                        }
                        else if (messageResult.failure === 1) {
                            this.caseService.lsSync.next(true);
                            this.caseService.dbSync.next(false);
                            this.showSnackBar.errorSnackBar('Case saved offline','OK');
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    });
            } else {
                await this.caseService
                    .updateCase(emergencyForm)
                    .then(data => {

                        if(data) {
                            this.loading = false;
                        }

                        if (data.status === 'saved') {

                            messageResult.failure = 1;

                        } else {

                            const resultBody = data as EmergencyResponse;
                            messageResult = this.getCaseSaveMessage(resultBody);
                        }

                        if (messageResult.failure === 0) {
                            this.caseService.dbSync.next(true);
                            this.caseService.lsSync.next(false);
                            this.showSnackBar.successSnackBar('Case updated successfully','OK',);
                            this.recordForm.markAsUntouched();
                        }
                        else{
                            this.caseService.dbSync.next(false);
                            this.caseService.lsSync.next(true);
                            this.showSnackBar.errorSnackBar('Case updated offline.','OK');
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
        }

    }

    emergencyNumberUpdated(emergencyNumber: any) {
        const guId = this.recordForm.get('emergencyDetails.guId')?.value;
        this.loadEmergencyNumber.emit({emergencyNumber , guId});
    }
}
