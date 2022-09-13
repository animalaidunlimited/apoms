import { Component, OnInit, Input, Output,EventEmitter, HostListener, ViewChild, ElementRef, NgZone, OnDestroy } from '@angular/core';
import { getCurrentTimeString } from '../../helpers/utils';
import { CrossFieldErrorMatcher } from '../../validators/cross-field-error-matcher';
import { FormGroup, Validators, FormBuilder, AbstractControl, FormArray, FormControl} from '@angular/forms';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { RescueDetailsParent } from 'src/app/core/models/responses';
import { RescueDetailsService } from 'src/app/modules/emergency-register/services/rescue-details.service';
import { UpdateResponse } from '../../models/outstanding-case';
import { Observable, of, Subject } from 'rxjs';
import { User } from '../../models/user';
import { takeUntil } from 'rxjs/operators';
import { EmergencyCode } from '../../models/emergency-record';
import { Vehicle } from '../../models/vehicle';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'rescue-details',
  templateUrl: './rescue-details.component.html',
  styleUrls: ['./rescue-details.component.scss']
})
export class RescueDetailsComponent implements OnInit, OnDestroy {

    private ngUnsubscribe = new Subject();
    private ngUnsubscribeValidators = new Subject();

    @Input() emergencyCaseId!: number;
    @Input() recordForm!: FormGroup;
    @Output() public result = new EventEmitter<UpdateResponse>();

    @ViewChild('rescueTimeField', { read: ElementRef, static: false }) rescueTimeFieldElement!: ElementRef;
    @ViewChild('ambulanceArrivalTimeField', { read: ElementRef, static: false }) ambulanceArrivalTimeField!: ElementRef;
    @ViewChild('ambulanceAssignmentTimeField', { read: ElementRef, static: false }) ambulanceAssignmentTimeField!: ElementRef;
    @ViewChild('emergencyCode', { read: ElementRef, static: true }) emergencyCode!: ElementRef;

    emergencyCodes$!: Observable<EmergencyCode[]>;

    ambulanceAssigned = false;

    callDateTimeForm!: AbstractControl;
    callOutcome!: AbstractControl;

    code = new FormControl();

    get assignedVehicleId() { return this.recordForm.get('rescueDetails.assignedVehicleId')};
    get ambulanceArrivalTime() { return this.recordForm.get('rescueDetails.ambulanceArrivalTime')};
    get ambulanceAssignmentTime () { return this.recordForm.get('rescueDetails.ambulanceAssignmentTime')};
    get rescueTime() { return this.recordForm.get('rescueDetails.rescueTime')};
    get admissionTime() { return this.recordForm.get('rescueDetails.admissionTime')};
    get callDateTime() { return this.recordForm.get('emergencyDetails.callDateTime')};

    currentTime!: string;

    errorMatcher = new CrossFieldErrorMatcher();

    rescueDetailsVal!: RescueDetailsParent;
    rescueDetails: FormGroup = new FormGroup({});
    rescueDetails$: FormGroup = new FormGroup({});

    rescuerArray!: FormArray;
    rescuers$!: Observable<User[]>;

    selfAdmission = false;
    streetTreat = false;

    vehicleList$!: Observable<Vehicle[]>;


    @HostListener('document:keydown.control.shift.q', ['$event'])
    rescueTimeFocus(event: KeyboardEvent) {
        event.preventDefault();
        this.rescueTimeFieldElement.nativeElement.focus();
    }

    @HostListener('document:keydown.control.e', ['$event'])
    emergencyCodeFocus(event: KeyboardEvent) {
        event.preventDefault();
        this.emergencyCode.nativeElement.focus();
    }

    @HostListener('document:keydown.control.shift.a', ['$event'])
    ambulanceArrivalTimeFocus(event: KeyboardEvent) {
        event.preventDefault();
        this.ambulanceArrivalTimeField.nativeElement.focus();
    }

    constructor(
        private dropdowns: DropdownService,
        private rescueDetailsService: RescueDetailsService,
        private zone: NgZone,
        private fb: FormBuilder
    ) {}

    ngOnInit() {

        this.emergencyCodes$ = this.dropdowns.getEmergencyCodes();

        this.recordForm.addControl(
            'rescueDetails',
            this.fb.group({
                assignedVehicleId: [],
                ambulanceAssignmentTime: [''],
                ambulanceArrivalTime: [''],
                rescueTime: [''],
                admissionTime: [''],
                selfAdmission: false,
                code: this.code,
                rescuers: this.fb.array([])
            }),
        );

		this.rescuers$ = this.dropdowns.getRescuers();
        this.rescueDetails = this.recordForm.get('rescueDetails') as FormGroup;

        this.rescueDetailsService
            .getRescueDetailsByEmergencyCaseId(this.emergencyCaseId || 0)
            .pipe(takeUntil(this.ngUnsubscribe))
            // tslint:disable-next-line: deprecation
            .subscribe((rescueDetails: RescueDetailsParent) => {

                this.emergencyCodes$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((codes:EmergencyCode[]) => {

                    rescueDetails?.rescueDetails?.rescuers?.forEach(rescuer => {

                        this.rescuerArray = this.recordForm.get('rescueDetails.rescuers') as FormArray;

                        const rescuerGroup = this.fb.group({
                            rescuerId: [{value: rescuer.rescuerId, disabled: true}]
                        });

                        this.rescuerArray.push(rescuerGroup);
                    });

                    const selectedCode = codes.find(code => code.EmergencyCodeId === rescueDetails?.emergencyDetails?.code as any);

                    if (selectedCode) {
                        this.code?.setValue(selectedCode);
                    }
                });
                this.zone.run(() => {

                    this.recordForm.patchValue(rescueDetails);
                    this.rescueDetailsVal = rescueDetails;
                    this.refreshValueChangesSubscriptions();
                });
            });

        this.code.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(code => {

                this.recordForm.get('emergencyDetails.code')?.setValue(code, {emitEvent: false});
                this.recordForm.get('rescueDetails.code')?.setValue(code, {emitEvent: false});

            });

        this.rescueDetails.get('selfAdmission')?.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(changedSelfAdmissionValue => {

                this.selfAdmission = changedSelfAdmissionValue;

                if(changedSelfAdmissionValue){

                    this.assignedVehicleId?.setValue(null)
                    this.ambulanceArrivalTime?.setValue(null)
                    this.ambulanceAssignmentTime?.setValue(null);
                    this.rescueTime?.setValue(null)

                }

            });

        this.recordForm.get('rescueDetails.ambulanceAssignmentTime')?.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(val=> {

                this.ambulanceAssigned = val ? true : false;

                if(val) {
                    this.recordForm.get('assignedVehicleId')?.enable();

                    this.vehicleList$ = this.rescueDetailsService.getVehicleListByAssignmentTime(val);
                }
                else {
                    this.recordForm.get('assignedVehicleId')?.disable();
                    this.vehicleList$ = of([]);
                }

            });



        this.updateTimes();

        this.refreshValueChangesSubscriptions();
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    private refreshValueChangesSubscriptions() : void {
        this.ngUnsubscribeValidators.next();
        this.subscribeToValueChanges('rescueDetails');
        this.subscribeToValueChanges('emergencyDetails.callDateTime');
        this.subscribeToValueChanges('rescueDetails.selfAdmission');
        this.subscribeToValueChanges('callOutcome.CallOutcome');
        this.subscribeToValueChanges('rescueDetails.ambulanceAssignmentTime');
    }

    private subscribeToValueChanges(abstractControlName: string) : void {
        this.recordForm
            .get(abstractControlName)?.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .pipe(takeUntil(this.ngUnsubscribeValidators))
            .subscribe(() => {
                // The values won't have bubbled up to the parent yet, so wait for one tick
                setTimeout(() => this.updateValidators(), 0);
            });
    }

    updateValidators() : void {

        this.ambulanceArrivalTime?.clearValidators();
        this.rescueTime?.clearValidators();
        this.admissionTime?.clearValidators();
        this.assignedVehicleId?.clearValidators();
        this.ambulanceAssignmentTime?.clearValidators();

        // if assignedVehicleId then set the other to required
        if (this.assignedVehicleId?.value > 0) {

            this.recordForm.get('emergencyDetails.code')?.setValidators([Validators.required]);

            this.code?.setValidators([Validators.required]);

        } else if (!this.selfAdmission) {
            this.recordForm.get('emergencyDetails.code')?.clearValidators();

            this.code?.clearValidators();

        }

        // if ambulance arrived then assignedVehicleId, rescue time required
        if (this.ambulanceArrivalTime?.value || this.ambulanceAssignmentTime?.value) {

            this.assignedVehicleId?.setValidators([Validators.required]);
            this.code?.setValidators([Validators.required]);
            this.ambulanceAssignmentTime?.setValidators([Validators.required]);

        } else if(this.ambulanceAssignmentTime?.value === '' || this.ambulanceArrivalTime?.value === ''){

            this.assignedVehicleId?.clearValidators();
        }

        // if rescue time then assignedVehicleId, ambulance arrived required
        if (this.rescueTime?.value) {

            this.assignedVehicleId?.setValidators([Validators.required]);
            this.ambulanceArrivalTime?.setValidators([Validators.required]);
            this.ambulanceAssignmentTime?.setValidators([Validators.required]);
        }

        if (
            Date.parse(this.ambulanceArrivalTime?.value) < Date.parse(this.callDateTime?.value) &&
            this.ambulanceArrivalTime?.value !== ''
        ) {
            this.ambulanceArrivalTime?.setErrors({ambulanceArrivalBeforeCallDatetime: true});
        }

        if (
            Date.parse(this.ambulanceArrivalTime?.value) > Date.parse(this.rescueTime?.value) &&
            this.rescueTime?.value !== '' &&
            this.ambulanceArrivalTime?.value !== ''
        ) {
            this.ambulanceArrivalTime?.setErrors({ambulanceArrivalAfterRescue: true});
        }

        if (
            Date.parse(this.ambulanceAssignmentTime?.value) > Date.parse(this.rescueTime?.value) &&
            this.rescueTime?.value !== ''
        ) {
            this.ambulanceAssignmentTime?.setErrors({ambulanceAssignedAfterRescue: true});
        }

        if (
            Date.parse(this.ambulanceAssignmentTime?.value) > Date.parse(this.ambulanceArrivalTime?.value) &&
            this.ambulanceArrivalTime?.value !== ''
        ) {
            this.ambulanceAssignmentTime?.setErrors({ambulanceAssignedAfterArrival: true});
        }

        if (
            Date.parse(this.ambulanceAssignmentTime?.value) < Date.parse(this.callDateTime?.value) &&
            this.callDateTime?.value !== ''
        ) {
            this.ambulanceAssignmentTime?.setErrors({ambulanceAssignedBeforeCall: true});
        }

        if (
            Date.parse(this.rescueTime?.value) < Date.parse(this.callDateTime?.value) &&
            this.rescueTime?.value !== ''
        ) {
            this.rescueTime?.setErrors({ rescueBeforeCallDatetime: true });
        }


        if (
            Date.parse(this.admissionTime?.value) < Date.parse(this.callDateTime?.value) &&
            this.admissionTime?.value !== ''
        ) {
            this.admissionTime?.setErrors({ admissionBeforeCallDatetime: true });
        }


        // if admission time then assignedVehicleId, ambulance arrived required, rescue time
        if (this.admissionTime?.value) {

            this.assignedVehicleId?.setValidators([Validators.required]);

            if (Date.parse(this.rescueTime?.value) < Date.parse(this.callDateTime?.value)) {

                this.rescueTime?.setErrors({ rescueBeforeCallDatetime: true });

            } else if(this.rescueDetails.get('selfAdmission')?.value !== true){

                this.rescueTime?.setValidators([Validators.required]);

            }
        }

        if (
            Date.parse(this.rescueTime?.value) > Date.parse(this.admissionTime?.value)
        ) {

            this.rescueTime?.setValidators([Validators.required]);
            this.rescueTime?.setErrors({ rescueAfterAdmission: true });

        }


        const patientArray = this.recordForm.get('patients') as FormArray;

        const admission = patientArray?.controls.some(currentPatient =>
                currentPatient.get('callOutcome.CallOutcome')?.value?.CallOutcome === 'Admission'
        );

        // When we select admission, we need to check that we have rescue details


         if (admission) {

             this.admissionTime?.setValidators([Validators.required]);

             if(!this.selfAdmission){

                this.assignedVehicleId?.setValidators([Validators.required]);
                this.rescueTime?.setValidators([Validators.required]);
                this.ambulanceArrivalTime?.setValidators([Validators.required]);
                this.ambulanceAssignmentTime?.setValidators([Validators.required]);
                this.code?.setValidators([Validators.required]);
                this.recordForm.get('emergencyDetails.code')?.setValidators([Validators.required]);

             }
         }

         const streetTreat = patientArray?.controls.some(currentPatient =>
            currentPatient.get('callOutcome.CallOutcome')?.value?.CallOutcome === 'Street treatment approved by ST manager'
        );

        if (streetTreat) {
            this.assignedVehicleId?.setValidators([Validators.required]);
            this.ambulanceAssignmentTime?.setValidators([Validators.required]);
        }

        this.ambulanceAssignmentTime?.updateValueAndValidity({ emitEvent: false });
        this.assignedVehicleId?.updateValueAndValidity({ emitEvent: false });
        this.rescueTime?.updateValueAndValidity({ emitEvent: false });
        this.ambulanceArrivalTime?.updateValueAndValidity({ emitEvent: false });
        this.ambulanceAssignmentTime?.updateValueAndValidity({ emitEvent: false });
        this.code?.updateValueAndValidity({ emitEvent: false });
        this.recordForm.get('emergencyDetails.code')?.updateValueAndValidity({ emitEvent: false });

    }

    setInitialTime(event: any) : void {

        const currentTime = this.recordForm.get('rescueDetails')?.get(event.target.name)?.value;

        if (!currentTime) {
            this.recordForm
                .get('rescueDetails')
                ?.get(event.target.name)
                ?.setValue(getCurrentTimeString());
        }

    }

    updateTimes() : void {

        this.currentTime = getCurrentTimeString();
    }

    async save() : Promise<void> {
        // If we haven't touched the form, don't do anything.
        if (!this.recordForm.touched) {
            const emptyResult: UpdateResponse = {
                success: 0,
                socketEndPoint: '',
            };

            this.result.emit(emptyResult);
            return;
        }

        this.recordForm
            .get('emergencyDetails.updateTime')
            ?.setValue(getCurrentTimeString());

        await this.rescueDetailsService
            .updateRescueDetails(this.recordForm.value)
            .then((data: UpdateResponse) => {
                this.result.emit(data);
            });
    }

    compareEmergencyCodes(o1: EmergencyCode, o2: EmergencyCode) : boolean {
        return o1?.EmergencyCodeId === o2?.EmergencyCodeId;
    }

    selectEmergencyCode($event: KeyboardEvent) : void {

        // Now we're using a selection trigger the keystroke no longer works, so we need to check for it
        this.emergencyCodes$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((codes:EmergencyCode[]) => {

            const selectedCode = codes.find((code:EmergencyCode) =>
                code.EmergencyCode.substr(0,1).toLowerCase() === $event.key.toLowerCase()
            );

            if (selectedCode) {
                this.recordForm.get('emergencyDetails.code')?.setValue(selectedCode);

                this.code?.setValue(selectedCode,{emitEvent: false});
            }
        });
    }
}
