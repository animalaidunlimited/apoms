import { EmergencyRecordCommentDialogComponent } from './emergency-record-comment-dialog/emergency-record-comment-dialog.component';
import { Component, OnInit, Input, Output, EventEmitter, HostListener, OnDestroy, ElementRef, ViewChildren, ViewChild } from '@angular/core';
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
import { ActivatedRoute} from '@angular/router';
import { LogsComponent } from 'src/app/core/components/logs/logs.component';
import { MatDialog } from '@angular/material/dialog';
import { EmergencyDetailsComponent } from 'src/app/core/components/emergency-details/emergency-details.component';


@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'emergency-record',
    templateUrl: './emergency-record.component.html',
    styleUrls: ['./emergency-record.component.scss'],
})

export class EmergencyRecordComponent implements OnInit, OnDestroy {

    private ngUnsubscribe = new Subject();

    @Input() emergencyCaseId: number | undefined;
    @Input() guId!: BehaviorSubject<string>;
    @Output() public loadEmergencyNumber = new EventEmitter<any>();

    @ViewChild(EmergencyDetailsComponent) emergencyDetailsComponent!:EmergencyDetailsComponent;

    currentTime = '';
    errorMatcher = new CrossFieldErrorMatcher();

    hasComments!: boolean;
    loading = false;

    notificationDurationSeconds = 3;
    recordForm: FormGroup = new FormGroup({});
    syncedToLocalStorage = false;

    windowWidth = window.innerWidth;

    hasWritePermission = false;

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
        private userOptions: UserOptionsService,
        private caseService: CaseService,
        private showSnackBar: SnackbarService,
        private route: ActivatedRoute,
        private elementRef: ElementRef,
        public dialog: MatDialog,
    ) {

    }

    ngOnInit() {

        this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val=> {

            if (val.componentPermissionLevel?.value === 2) {

                this.hasWritePermission = true;
            }

        });

        this.notificationDurationSeconds = this.userOptions.getNotifactionDuration();

        this.recordForm = this.fb.group({
            emergencyDetails: this.fb.group({
                guId : [this.guId.value],
                emergencyCaseId: [this.emergencyCaseId],
                updateTime: [''],
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


        this.recordForm.reset({});

        this.resetPatientFormArray();

        this.guId.next(this.caseService.generateUUID());

        this.loadEmergencyNumber.emit({emergencyNumber : 'New Case*' , GUID: this.guId.value});

        this.recordForm.get('emergencyDetails.guId')?.setValue(this.guId.value, {emitEvent:false});
        this.recordForm.get('emergencyDetails.code')?.setValue({
            EmergencyCodeId: null,
            EmergencyCode: null
        },{emitEvent:false});

        this.recordForm.get('emergencyDetails.callDateTime')?.setValue(getCurrentTimeString(),{emitEvent:false});

    }

    private resetPatientFormArray() {
        const patientArray = this.recordForm.get('patients') as FormArray;
        const firstPatient = patientArray.at(0);
        const firstProblems = firstPatient.get('problems') as FormArray;

        firstPatient.get('deleted')?.setValue(false);
        firstPatient.get('duplicateTag')?.setValue(false);

        firstProblems.clear();
        patientArray.clear();
        patientArray.push(firstPatient);
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

            if (patient.success === 1 && patient.admissionSuccess !== -1) {
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
            }
            else if(patient.admissionSuccess === -1) {
                result.failure = 2;
            }

            else {
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

        this.loading = true;

            // The Emergency Number check might have gotten stuck due to the connection to the DB going down.
            // So mark it as error so the user knows to recheck it
            this.recordForm.updateValueAndValidity();
            if(this.hasWritePermission) {
                this.loading = true;
                if(this.recordForm.pending){
                    // The Emergency Number check might have gotten stuck due to the connection to the DB going down.
                    // So mark it as error so the user knows to recheck it
                    this.recordForm.updateValueAndValidity();

                    if(this.recordForm.pending && this.recordForm.get('emergencyDetails.emergencyNumber')?.pending){
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

                                    // this.recordForm.get('callerDetails.callerId')?.setValue(resultBody.callerId);

                                    this.emergencyCaseId = resultBody.emergencyCaseId;

                                    this.recordForm.get('emergencyDetails.emergencyCaseId')?.setValue(this.emergencyCaseId);
                                    this.recordForm.get('emergencyDetails.emergencyNumber')?.setValue(resultBody.emergencyNumber);
                                    messageResult = this.getCaseSaveMessage(resultBody);

                                }

                                if (messageResult.failure === 0) {
                                    this.showSnackBar.successSnackBar('Case inserted successfully','OK');
                                    this.syncedToLocalStorage = false;
                                    this.recordForm.markAsPristine();
                                }
                                else if (messageResult.failure === -1) {
                                    this.showSnackBar.successSnackBar('Duplicate case, please reload case','OK');
                                }
                                else if (messageResult.failure === 2){
                                    this.showSnackBar.warningSnackBar('Case inserted successfully, but area admission failed: see admin.', 'OK');
                                }
                                else if (messageResult.failure === 1) {
                                    this.showSnackBar.errorSnackBar('Case saved offline','OK');
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

                                    this.showSnackBar.successSnackBar('Case updated successfully','OK');
                                    this.syncedToLocalStorage = false;
                                    this.recordForm.markAsPristine();
                                }
                                else if (messageResult.failure === 1){
                                    this.showSnackBar.errorSnackBar('Case updated offline.','OK');
                                    this.syncedToLocalStorage = true;
                                    this.recordForm.markAsPristine();
                                }
                                else if (messageResult.failure === 2){
                                    this.showSnackBar.warningSnackBar('Case updated successfully, but area admission failed: see admin.', 'OK');
                                }
                                else{
                                    this.showSnackBar.errorSnackBar('Unknown error, please see admin.','OK');
                                }
                            })
                            .catch(error => {
                                console.log(error);
                            });
                    }
                }
            }

            else {
                this.showSnackBar.errorSnackBar('You do not have permission to save; please see the admin' , 'OK');
            }

    }

    emergencyNumberUpdated(emergencyNumber: any) {

        this.loadEmergencyNumber.emit({emergencyNumber, GUID : this.recordForm.get('emergencyDetails.guId')?.value});
    }

    openLogsDialog(emergencyCaseId: number,emergencyNumber:number) {
        const dialogRef = this.dialog.open(LogsComponent, {
            maxHeight: '100vh',
            maxWidth: '100vw',
            data: {
                emergencyCaseId,
                emergencyNumber,
                patientFormArray: (this.recordForm.get('patients') as FormArray).controls,
            },
        });

        dialogRef
            .afterClosed()
            .subscribe(() => {})
            .unsubscribe();
    }

    openCommentDialog(){
        const dialogRef = this.dialog.open(EmergencyRecordCommentDialogComponent, {

            data:{
                caseComment:this.recordForm.get('caseComments')?.value
            }
        });

        dialogRef
            .afterClosed().pipe(
                takeUntil(this.ngUnsubscribe)
            )
            .subscribe((caseComment) => {
                if(caseComment)
                {
                    this.hasComments = true;
                    this.recordForm.get('caseComments')?.setValue(caseComment);
                }
            });
    }

    tabPresses($event:boolean){
        this.emergencyDetailsComponent.dispatcher.nativeElement.focus();
    }

}
