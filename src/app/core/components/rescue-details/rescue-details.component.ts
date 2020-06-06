import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { getCurrentTimeString } from '../../utils';
import { CrossFieldErrorMatcher } from '../../validators/cross-field-error-matcher';
import {
    FormGroup,
    Validators,
    FormBuilder,
    AbstractControl,
} from '@angular/forms';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { RescueDetailsParent } from 'src/app/core/models/responses';
import { RescueDetailsService } from 'src/app/modules/emergency-register/services/rescue-details.service';
import { UpdatedRescue } from '../../models/outstanding-case';

@Component({
    selector: 'rescue-details',
    templateUrl: './rescue-details.component.html',
    styleUrls: ['./rescue-details.component.scss'],
})
export class RescueDetailsComponent implements OnInit {
    @Input() emergencyCaseId: number;
    @Input() recordForm: FormGroup;
    @Output() public result = new EventEmitter<UpdatedRescue>();

    errorMatcher = new CrossFieldErrorMatcher();

    currentCallDateTime;
    currentAdmissionTime;
    currentAmbulanceArrivalTime;
    currentRescueTime;
    currentTime;

    rescuer1Id: AbstractControl;
    rescuer2Id: AbstractControl;
    ambulanceArrivalTime: AbstractControl;
    rescueTime: AbstractControl;
    admissionTime: AbstractControl;
    callDateTimeForm: AbstractControl;
    callOutcome: AbstractControl;
    callDateTime: AbstractControl;

    constructor(
        private dropdowns: DropdownService,
        private rescueDetailsService: RescueDetailsService,
        private fb: FormBuilder,
    ) {}

    rescuers$;
    rescueDetails$;

    ngOnInit() {
        this.rescuers$ = this.dropdowns.getRescuers();

        this.recordForm.addControl(
            'rescueDetails',
            this.fb.group({
                rescuer1Id: [],
                rescuer2Id: [],
                ambulanceArrivalTime: [''],
                rescueTime: [''],
                admissionTime: [''],
            }),
        );

        this.rescueDetailsService
            .getRescueDetailsByEmergencyCaseId(this.emergencyCaseId || 0)
            .subscribe((rescueDetails: RescueDetailsParent) => {
                this.recordForm.patchValue(rescueDetails);
            });

        this.rescuer1Id = this.recordForm.get('rescueDetails.rescuer1Id');
        this.rescuer2Id = this.recordForm.get('rescueDetails.rescuer2Id');
        this.ambulanceArrivalTime = this.recordForm.get(
            'rescueDetails.ambulanceArrivalTime',
        );
        this.rescueTime = this.recordForm.get('rescueDetails.rescueTime');
        this.admissionTime = this.recordForm.get('rescueDetails.admissionTime');
        this.callDateTime = this.recordForm.get(
            'emergencyDetails.callDateTime',
        );
        this.callOutcome = this.recordForm.get('callOutcome.callOutcome');

        this.updateTimes();

        this.onChanges();
    }

    updateValidators() {
        this.ambulanceArrivalTime.clearValidators();
        this.rescueTime.clearValidators();
        this.admissionTime.clearValidators();
        this.rescuer1Id.clearValidators();
        this.rescuer2Id.clearValidators();

        this.ambulanceArrivalTime.updateValueAndValidity({ emitEvent: false });
        this.rescueTime.updateValueAndValidity({ emitEvent: false });
        this.admissionTime.updateValueAndValidity({ emitEvent: false });

        // if rescuer1Id || rescuer2Id then set the other to required
        if (this.rescuer1Id.value > 0 || this.rescuer2Id.value > 0) {
            this.rescuer2Id.setValidators([Validators.required]);
            this.rescuer1Id.setValidators([Validators.required]);
        }

        // if ambulance arrived then rescuer1Id, rescuer2Id, resuce time required
        if (this.ambulanceArrivalTime.value) {
            this.rescuer2Id.setValidators([Validators.required]);
            this.rescuer1Id.setValidators([Validators.required]);
        }

        // if rescue time then rescuer1Id, rescuer2Id, ambulance arrived required
        if (this.rescueTime.value) {
            this.rescuer2Id.setValidators([Validators.required]);
            this.rescuer1Id.setValidators([Validators.required]);
        }

        if (
            this.ambulanceArrivalTime.value < this.callDateTime.value &&
            this.ambulanceArrivalTime.value != ''
        ) {
            this.ambulanceArrivalTime.setErrors({
                ambulanceArrivalBeforeCallDatetime: true,
            });
        }

        if (
            this.ambulanceArrivalTime.value > this.rescueTime.value &&
            this.rescueTime.value != '' &&
            this.ambulanceArrivalTime.value != ''
        ) {
            this.ambulanceArrivalTime.setErrors({
                ambulanceArrivalAfterRescue: true,
            });
        }

        if (
            this.rescueTime.value < this.callDateTime.value &&
            this.rescueTime.value != ''
        ) {
            this.rescueTime.setErrors({ rescueBeforeCallDatetime: true });
        }

        if (
            this.admissionTime.value < this.callDateTime.value &&
            this.admissionTime.value != ''
        ) {
            this.admissionTime.setErrors({ admissionBeforeCallDatetime: true });
        }

        // if admission time then rescuer1Id, rescuer2Id, ambulance arrived required, rescue time
        if (this.admissionTime.value) {
            this.rescuer2Id.setValidators([Validators.required]);
            this.rescuer1Id.setValidators([Validators.required]);

            if (this.rescueTime.value < this.callDateTime.value) {
                this.rescueTime.setErrors({ rescueBeforeCallDatetime: true });
            } else {
                this.rescueTime.setValidators([Validators.required]);
                this.rescueTime.updateValueAndValidity({ emitEvent: false });
            }
        }

        if (
            this.rescueTime.value > this.admissionTime.value &&
            this.admissionTime.value != ''
        ) {
            this.rescueTime.setErrors({ rescueAfterAdmission: true });
            this.admissionTime.setErrors({ rescueAfterAdmission: true });
        }

        // When we select admission, we need to check that we have rescue details
        if (this.callOutcome.value?.CallOutcome == 'Admission') {
            this.rescuer2Id.setValidators([Validators.required]);
            this.rescuer1Id.setValidators([Validators.required]);

            this.rescueTime.setValidators([Validators.required]);
            this.rescueTime.updateValueAndValidity({ emitEvent: false });
            this.admissionTime.setValidators([Validators.required]);
            this.admissionTime.updateValueAndValidity({ emitEvent: false });
        }

        this.rescuer1Id.updateValueAndValidity({ emitEvent: false });
        this.rescuer2Id.updateValueAndValidity({ emitEvent: false });
    }

    onChanges(): void {
        this.recordForm.valueChanges.subscribe(val => {
            // The values won't have bubbled up to the parent yet, so wait for one tick
            setTimeout(() => this.updateValidators());
        });
    }

    setInitialTime(event) {
        this.currentCallDateTime = this.callDateTime;

        let currentTime;

        currentTime = this.recordForm
            .get('rescueDetails')
            .get(event.target.name).value;

        if (!currentTime) {
            this.recordForm
                .get('rescueDetails')
                .get(event.target.name)
                .setValue(getCurrentTimeString());
        }
    }

    updateTimes() {
        this.currentCallDateTime = this.callDateTime;

        const currentTime = getCurrentTimeString();

        this.currentRescueTime = this.rescueTime.value || currentTime;
        this.currentAdmissionTime = this.admissionTime.value || currentTime;
        this.currentAmbulanceArrivalTime =
            this.ambulanceArrivalTime.value || currentTime;

        this.currentTime = currentTime;
    }

    async save() {
        // If we haven't touched the form, don't do anything.
        if (!this.recordForm.touched) {
            this.result.emit(null);
            return;
        }

        this.recordForm
            .get('emergencyDetails.updateTime')
            .setValue(getCurrentTimeString());

        await this.rescueDetailsService
            .updateRescueDetails(this.recordForm.value)
            .then((data: UpdatedRescue) => this.result.emit(data));
    }
}
