import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, AbstractControl, FormArray, FormGroup, Validators } from '@angular/forms';
import { getCurrentTimeString } from '../../../../core/helpers/utils';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { PatientService } from 'src/app/core/services/patient/patient.service';
import { CallType, PatientCallOutcome, SuccessOnlyResponse } from 'src/app/core/models/responses';
import { Observable } from 'rxjs';
import { User } from 'src/app/core/models/user';
import {
    PatientCalls,
    PatientCallModifyResponse,
} from 'src/app/core/models/patients';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { take } from 'rxjs/operators';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'patient-call',
    templateUrl: './patient-call.component.html',
    styleUrls: ['./patient-call.component.scss'],
})
export class PatientCallComponent implements OnInit, OnChanges {
    @Input() patientId!: number;

    patientCallForm!: FormGroup;

    callerHappy = true;
    hasVisited = false;
    maxDate: string | Date = '';
    notificationDurationSeconds = 3;

    callTypes$: Observable<CallType[]>;
    callOutcomes$: Observable<PatientCallOutcome[]>;
    assignedTo$: Observable<User[]>;

    errorMatcher = new CrossFieldErrorMatcher();

    constructor(
        private fb: FormBuilder,
        private userOptions: UserOptionsService,
        private patientService: PatientService,
        private dropdown: DropdownService,
        private showSnackBar: SnackbarService,
    ) {

        this.assignedTo$ = this.dropdown.getCallStaff();
        this.callOutcomes$ = this.dropdown.getPatientCallOutcomes();
        this.callTypes$ = this.dropdown.getCallTypes();

    }

    calls: FormArray = new FormArray([]);

    ngOnInit() {


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

            const patientIdControl = this.patientCallForm.get('patientId');

            if(patientIdControl){
                patientIdControl.setValue(changes.patientId.currentValue);
                this.loadPatientCalls();
            }


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
            .pipe(take(1))
            .subscribe((data: PatientCalls) => {this.populatePatientCalls(data);});
    }

    populatePatientCalls(data: PatientCalls) {

        const length:number = data?.calls.length;

        if(length){

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

        const currentElement: AbstractControl = currentCall.get(element) as AbstractControl;

        const currentTime: string | Date = currentElement.value;

        if (!currentTime) {
            currentElement.setValue(getCurrentTimeString());
        }
    }

    async savePatientCall() {
        // TODO replace this with a filter to return only the touched elements
        this.calls.controls.forEach(element => {
            if (element.touched) {
                const updatedControl = element.get('updated');

                if(updatedControl){
                updatedControl.setValue(true);
                }
                else {
                    throw new Error('Updated control is empty');

                }
            }
        });

        await this.patientService
            .savePatientCalls(this.patientCallForm.value)
            .then((result: PatientCallModifyResponse[]) => {
               let comErrorFlag = false;
               let resErrorFlag = false;

               comErrorFlag = result.some(res=>
                   res.success === -1
               );

               resErrorFlag = result.some(res=>
                   res.results.success !== 1
               );


               this.toastResultMessage(comErrorFlag, resErrorFlag);


                result.forEach((callResult: PatientCallModifyResponse) => {
                    this.calls.controls.forEach(call => {
                        const currentPatientCallId = call.get(
                            'patientCallId',
                        ) as AbstractControl;

                        currentPatientCallId.setValue(
                            callResult.position === call.get('position')?.value
                                ? callResult.results.patientCallId
                                : currentPatientCallId.value,
                        );
                    });
                });
            });
    }

    toastResultMessage(comErrorFlag: boolean, resErrorFlag: boolean) {
        comErrorFlag ?

        this.showSnackBar.errorSnackBar('Communication error, See admin.', 'Ok') :

        resErrorFlag ?

        this.showSnackBar.errorSnackBar('Failed to save', 'Ok') :

        this.showSnackBar.successSnackBar('Save successful' , 'Ok');


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
}
