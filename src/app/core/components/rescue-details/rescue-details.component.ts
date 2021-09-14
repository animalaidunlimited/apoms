import { Component, OnInit, Input, Output,EventEmitter, HostListener, ViewChild, ElementRef, NgZone, OnDestroy } from '@angular/core';
import { getCurrentTimeString } from '../../helpers/utils';
import { CrossFieldErrorMatcher } from '../../validators/cross-field-error-matcher';
import { FormGroup, Validators, FormBuilder, AbstractControl, FormArray, FormControl} from '@angular/forms';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { RescueDetailsParent } from 'src/app/core/models/responses';
import { RescueDetailsService } from 'src/app/modules/emergency-register/services/rescue-details.service';
import { UpdateResponse } from '../../models/outstanding-case';
import { Observable, Subject } from 'rxjs';
import { User } from '../../models/user';
import { takeUntil } from 'rxjs/operators';
import { EmergencyCode } from '../../models/emergency-record';
import { Vehicle } from '../../models/driver-view';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'rescue-details',
  templateUrl: './rescue-details.component.html',
  styleUrls: ['./rescue-details.component.scss']
})
export class RescueDetailsComponent implements OnInit, OnDestroy {
    private ngUnsubscribe = new Subject();

    @Input() emergencyCaseId!: number;
    @Input() recordForm!: FormGroup;
    @Output() public result = new EventEmitter<UpdateResponse>();

    @ViewChild('rescueTimeField', { read: ElementRef, static: true }) rescueTimeField!: ElementRef;
    @ViewChild('ambulanceArrivalTimeField', { read: ElementRef, static: true }) ambulanceArrivalTimeField!: ElementRef;
    @ViewChild('ambulanceAssignmentTimeField', { read: ElementRef, static: true }) ambulanceAssignmentTimeField!: ElementRef;
    @ViewChild('emergencyCode', { read: ElementRef, static: true })

    emergencyCode!: ElementRef;
    vehicleListDisabled = true;

    emergencyCodes$!: Observable<EmergencyCode[]>;

    admissionTime: AbstractControl | undefined | null;
    ambulanceArrivalTime: AbstractControl | undefined | null;
    ambulanceAssignmentTime: AbstractControl | undefined | null;
    assignedVehicleId: AbstractControl | undefined | null;

    callDateTimeForm!: AbstractControl;
    callOutcome!: AbstractControl;
    callDateTime: AbstractControl | undefined | null;

    currentCallDateTime!: AbstractControl | undefined | null;
    currentAdmissionTime!: AbstractControl;
    currentAmbulanceArrivalTime!: AbstractControl;
    currentRescueTime!: AbstractControl;
    currentTime!: string;
    rescueDetailsVal!: RescueDetailsParent;

    errorMatcher = new CrossFieldErrorMatcher();

    rescueDetails: FormGroup = new FormGroup({});
    rescueDetails$: FormGroup = new FormGroup({});
    code = new FormControl();

    rescueTime: AbstractControl | undefined | null;

    rescuerArray!: FormArray;

    rescuers$!: Observable<User[]>;
    vehicleList$!: Observable<Vehicle[]>;


    @HostListener('document:keydown.control.shift.q', ['$event'])
    rescueTimeFocus(event: KeyboardEvent) {
        event.preventDefault();
        this.rescueTimeField.nativeElement.focus();
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
                code: this.code,
                rescuers: this.fb.array([])
            }),
        );

        // this.vehicleList$ = this.dropdowns.getVehicleListDropdown();

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
                });
            });

        this.code.valueChanges.subscribe(code =>{

            this.recordForm.get('emergencyDetails.code')?.setValue(code);
            this.recordForm.get('rescueDetails.code')?.setValue(code, {emitEvent: false});

        });

        this.recordForm.get('rescueDetails.ambulanceAssignmentTime')?.valueChanges.subscribe(val=> {

            if(val) {
                this.vehicleListDisabled = false;

                this.vehicleList$ = this.rescueDetailsService.getVehicleListByAssignmentTime(val);
            }
            else {
                this.vehicleListDisabled = true;
            }

            this.recordForm.patchValue(this.rescueDetailsVal);
            
        });

        this.assignedVehicleId = this.recordForm.get('rescueDetails.assignedVehicleId');
        this.ambulanceArrivalTime = this.recordForm.get('rescueDetails.ambulanceArrivalTime');
        this.ambulanceAssignmentTime  = this.recordForm.get('rescueDetails.ambulanceAssignmentTime');
        this.rescueTime = this.recordForm.get('rescueDetails.rescueTime');
        this.admissionTime = this.recordForm.get('rescueDetails.admissionTime');
        this.callDateTime = this.recordForm.get('emergencyDetails.callDateTime');

        this.updateTimes();

        this.onChanges();
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    onChanges(): void {
        this.subscribeToValueChanges('rescueDetails');
        this.subscribeToValueChanges('emergencyDetails.callDateTime');
        this.subscribeToValueChanges('callOutcome.CallOutcome');
        this.subscribeToValueChanges('rescueDetails.ambulanceAssignmentTime');
    }

    private subscribeToValueChanges(abstractControlName: string) {
        this.recordForm
            .get(abstractControlName)
            ?.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
            // tslint:disable-next-line: deprecation
            .subscribe((value) => {
                // The values won't have bubbled up to the parent yet, so wait for one tick
                setTimeout(() => this.updateValidators());
            });
    }

    updateValidators() {

        this.ambulanceArrivalTime?.clearValidators();
        this.rescueTime?.clearValidators();
        this.admissionTime?.clearValidators();

        this.ambulanceArrivalTime?.updateValueAndValidity({ emitEvent: false });
        this.rescueTime?.updateValueAndValidity({ emitEvent: false });
        this.admissionTime?.updateValueAndValidity({ emitEvent: false });

        // if assignedVehicleId then set the other to required
        if (this.assignedVehicleId?.value > 0) {

            this.recordForm.get('emergencyDetails.code')?.setValidators([Validators.required]);
            this.recordForm.get('emergencyDetails.code')?.updateValueAndValidity({ emitEvent: false });

            this.code?.setValidators([Validators.required]);
            this.code?.updateValueAndValidity({ emitEvent: false });
        } else {
            this.recordForm.get('emergencyDetails.code')?.clearValidators();
            this.recordForm.get('emergencyDetails.code')?.updateValueAndValidity({ emitEvent: false });
            this.code?.clearValidators();
            this.code?.updateValueAndValidity({ emitEvent: false });

        }

        // if ambulance arrived then assignedVehicleId, rescue time required
        if (this.ambulanceArrivalTime?.value || this.ambulanceAssignmentTime?.value) {
            this.assignedVehicleId?.setValidators([Validators.required]);
        } else if(this.ambulanceAssignmentTime?.value === '' || this.ambulanceArrivalTime?.value === ''){
            this.assignedVehicleId?.clearValidators();
        }

        // if rescue time then assignedVehicleId, ambulance arrived required
        if (this.rescueTime?.value) {
            this.assignedVehicleId?.setValidators([Validators.required]);
            this.ambulanceArrivalTime?.setValidators([Validators.required]);
            this.ambulanceArrivalTime?.updateValueAndValidity({ emitEvent: false });
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
            } else {
                this.rescueTime?.setValidators([Validators.required]);
                this.rescueTime?.updateValueAndValidity({ emitEvent: false });
            }
        }

        if (
            Date.parse(this.rescueTime?.value) > Date.parse(this.admissionTime?.value) &&
            this.admissionTime?.value !== ''
        ) {

            this.rescueTime?.setErrors({ rescueAfterAdmission: true });

            this.admissionTime?.setErrors({ rescueAfterAdmission: true });
        }


        const patientArray = this.recordForm.get('patients') as FormArray;

        const admission = patientArray?.controls.some(currentPatient =>
                currentPatient.get('callOutcome.CallOutcome')?.value?.CallOutcome === 'Admission'
        );

        // When we select admission, we need to check that we have rescue details

         if (admission) {
             this.assignedVehicleId?.setValidators([Validators.required]);

             this.rescueTime?.setValidators([Validators.required]);
             this.admissionTime?.setValidators([Validators.required]);
         }

        this.assignedVehicleId?.updateValueAndValidity({ emitEvent: false });
    }

    setInitialTime(event: any) {
        // TODO put this back in when we go live with the desk doing realtime entries

        this.currentCallDateTime = this.callDateTime;


        const currentTime = this.recordForm.get('rescueDetails')?.get(event.target.name)?.value;

        if (!currentTime) {
            this.recordForm
                .get('rescueDetails')
                ?.get(event.target.name)
                ?.setValue(getCurrentTimeString());
        }
    }

    updateTimes() {
        this.currentCallDateTime = this.callDateTime;

        const currentTime = getCurrentTimeString();

        this.currentRescueTime = this.rescueTime?.value || currentTime;
        this.currentAdmissionTime = this.admissionTime?.value || currentTime;
        this.currentAmbulanceArrivalTime =
            this.ambulanceArrivalTime?.value || currentTime;

        this.currentTime = currentTime;
    }

    async save() {
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

    compareEmergencyCodes(o1: EmergencyCode, o2: EmergencyCode): boolean {
        return o1?.EmergencyCodeId === o2?.EmergencyCodeId;
    }

    selectEmergencyCode($event: KeyboardEvent) {

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
