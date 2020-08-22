import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import {
    FormBuilder,
    AbstractControl,
    FormArray,
    FormGroup,
    Validators,
} from '@angular/forms';
import { getCurrentTimeString } from '../../../../core/utils';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { PatientService } from 'src/app/modules/emergency-register/services/patient.service';
import { CallType, PatientCallOutcome } from 'src/app/core/models/responses';
import { Observable } from 'rxjs';
import { User } from 'src/app/core/models/user';
import {
    PatientCalls,
    PatientCallModifyResponse,
} from 'src/app/core/models/patients';
import { UserOptionsService } from 'src/app/core/services/user-options.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
@Component({
    selector: 'patient-call',
    templateUrl: './patient-call.component.html',
    styleUrls: ['./patient-call.component.scss'],
})
export class PatientCallComponent implements OnInit {
    @Input() patientId: number;

    patientCallForm: FormGroup;

    callerHappy: boolean;
    hasVisited: boolean;
    maxDate: string | Date;
    notificationDurationSeconds: number;
    callTypes$: Observable<CallType[]>;
    callOutcomes$: Observable<PatientCallOutcome[]>;

    assignedTo$: Observable<User[]>;

    currentCallType: CallType;

    errorMatcher = new CrossFieldErrorMatcher();

    constructor(
        private fb: FormBuilder,
        private userOptions: UserOptionsService,
        private snackBar: MatSnackBar,
        private patientService: PatientService,
        private dropdown: DropdownService,
        private showSnackBar: SnackbarService,
    ) {}

    calls: FormArray;

    ngOnInit() {
        this.assignedTo$ = this.dropdown.getCallStaff();
        this.callOutcomes$ = this.dropdown.getPatientCallOutcomes();
        this.callTypes$ = this.dropdown.getCallTypes();

        this.maxDate = getCurrentTimeString();
        this.notificationDurationSeconds = this.userOptions.getNotifactionDuration();

        this.patientCallForm = this.buildPatientForm(this.patientCallForm);

        this.calls = this.patientCallForm.get('calls') as FormArray;
    }

    ngOnChanges(changes: SimpleChanges) {
        // Because we're loading this module late, the first change won't have
        // the incoming patientId in it.
        if (changes.patientId.currentValue) {
            // ngOnChanges runs before ngOnInit, so we may or may not have already populated
            // This form.
            this.patientCallForm = this.buildPatientForm(this.patientCallForm);

            this.patientCallForm
                .get('patientId')
                .setValue(changes.patientId.currentValue);
            this.loadPatientCalls();
        }
    }

    buildPatientForm(patientForm: FormGroup) {
        if (!patientForm) {
            patientForm = this.fb.group({
                patientId: [],
                calls: this.fb.array([]),
            });
        }

        return patientForm;
    }

    loadPatientCalls() {
        this.patientService
            .getPatientCallsByPatientId(this.patientId)
            .subscribe((data: PatientCalls) => {this.populatePatientCalls(data)});
    }

    populatePatientCalls(data: PatientCalls) {

        if(data?.calls.length){

            for (let i = 0; i < length; i++) {
                this.addPatientCall(false);
            }

            this.patientCallForm.patchValue(data);
        }
    }

    getNewCall(position: number, expanded: boolean) {
        return this.fb.group({
            position: [position, Validators.required],
            patientCallId: [],
            patientId: [],
            positiveCallOutcome: [true],
            callDateTime: [''],
            callType: [{}],
            assignedTo: [{}],
            PatientCallOutcomeId: [],
            createdDateTime: [''],
            createdBy: [],
            comments: [''],
            updated: [true],
            expanded: [expanded],
        });
    }

    setInitialTime(element: string, index: number) {
        const currentCall: FormGroup = this.calls.controls[index] as FormGroup;

        const currentElement: AbstractControl = currentCall.get(element);

        const currentTime: string | Date = currentElement.value;

        if (!currentTime) {
            currentElement.setValue(getCurrentTimeString());
        }
    }

    async savePatientCall() {
        // TODO replace this with a filter to return only the touched elements
        this.calls.controls.forEach(element => {
            if (element.touched) {
                element.get('updated').setValue(true);
            }
        });

        await this.patientService
            .savePatientCalls(this.patientCallForm.value)
            .then((result: PatientCallModifyResponse[]) => {
                this.toastResultMessage(result);

                result.forEach(callResult => {
                    this.calls.controls.forEach(call => {
                        const currentPatientCallId = call.get(
                            'patientCallId',
                        ) as AbstractControl;

                        currentPatientCallId.setValue(
                            callResult.position === call.get('position').value
                                ? callResult.results.patientCallId
                                : currentPatientCallId.value,
                        );
                    });
                });
            });
    }

    toastResultMessage(bread: PatientCallModifyResponse[]) {
        if (bread.length === 0) {
            this.showSnackBar.errorSnackBar(
                'Failed to save - can\'t connect to server',
                'OK',
            );
            return;
        }

        // Count the number of successful messages. If they're all successful, then toast
        // a success message, otherwise toast a fail message.

        const successCount = bread
            .map(message => {
                return message.results.success;
            })
            .reduce(
                (successCount: number, callResult) =>
                    (successCount += callResult),
            );

        const message =
            successCount === bread.length ? 'Save sucessful' : 'Failed to save';

        this.showSnackBar.successSnackBar(message, 'OK');
    }

    addPatientCall(expanded: boolean) {
        const length = (this.patientCallForm.get('calls') as FormArray).length;

        this.calls.push(this.getNewCall(length + 1, expanded));
    }

    compareCallTypes(callType1: CallType, callType2: CallType): boolean {
        return callType1 && callType2
            ? callType1.CallTypeId === callType2.CallTypeId
            : callType1 === callType2;
    }

    compareAssignedTo(assinedTo1: User, assignedTo2: User): boolean {
        return assinedTo1 && assignedTo2
            ? assinedTo1.UserId === assignedTo2.UserId
            : assinedTo1 === assignedTo2;
    }

    // openSnackBar(message: string, action: string) {
    //     this.snackBar.open(message, action, {
    //         duration: this.notificationDurationSeconds * 1000,
    //     });
    // }
}
