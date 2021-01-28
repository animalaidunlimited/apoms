import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener, AfterViewInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { DropdownService } from '../../services/dropdown/dropdown.service';
import { getCurrentTimeString } from '../../helpers/utils';
import { CrossFieldErrorMatcher } from '../../../core/validators/cross-field-error-matcher';
import { CaseService } from 'src/app/modules/emergency-register/services/case.service';
import { UniqueEmergencyNumberValidator } from '../../validators/emergency-number.validator';
import { UserOptionsService } from '../../services/user-option/user-options.service';
import { DatePipe, formatDate } from '@angular/common';
import { EmergencyCode } from '../../models/emergency-record';
import { Observable } from 'rxjs';
import { User } from '../../models/user';
import { RescueDetailsComponent } from '../rescue-details/rescue-details.component';
import { NUMBER_TYPE } from '@angular/compiler/src/output/output_ast';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'emergency-details',
    templateUrl: './emergency-details.component.html',
    styleUrls: ['./emergency-details.component.scss'],
})
export class EmergencyDetailsComponent implements OnInit, AfterViewInit {

    @Input() recordForm!: FormGroup;
    @Input() focusEmergencyNumber!: boolean;
    // @Input() guId!: string;
    @Output() public loadEmergencyNumber = new EventEmitter<any>();
    errorMatcher = new CrossFieldErrorMatcher();

    @ViewChild('emergencyNumber',{ read: ElementRef, static:true }) emergencyNumberField!: ElementRef;
    @ViewChild('callDateTimeField',{ read: ElementRef, static:true }) callDateTimeField!: ElementRef;

    dispatchers$!: Observable<User[]>;
    emergencyCodes$!: Observable<EmergencyCode[]>;
    callDateTime: string | Date = getCurrentTimeString();
    minimumDate = '';

    emergencyDetails!: FormGroup;

    constructor(
        private dropdowns: DropdownService,
        private caseService: CaseService,
        private datePipe: DatePipe,
        private userOptions: UserOptionsService,
        private emergencyNumberValidator: UniqueEmergencyNumberValidator,
    ) {

    }

    @HostListener('document:keydown.control.shift.c', ['$event'])
    focusCallDateTime(event: KeyboardEvent) {
        event.preventDefault();
        this.callDateTimeField.nativeElement.focus();
    }
    ngOnInit(): void {
        // this.getCurrentTimeStringInSeconds();

        this.dispatchers$ = this.dropdowns.getDispatchers();
        this.emergencyCodes$ = this.dropdowns.getEmergencyCodes();

        this.minimumDate = this.datePipe.transform(this.userOptions.getMinimumDate(), 'yyyy-MM-ddThh:mm:ss.ms') || '';

        this.emergencyDetails = this.recordForm.get('emergencyDetails') as FormGroup;

        const emergencyCaseId = this.recordForm.get('emergencyDetails.emergencyCaseId');

        this.emergencyDetails.addControl(
            'emergencyNumber',
            new FormControl()
        );

        this.emergencyDetails.addControl(
            'callDateTime',
            new FormControl(getCurrentTimeString(), Validators.required),
        );
        this.emergencyDetails.addControl(
            'dispatcher',
            new FormControl('', Validators.required),
        );
        this.emergencyDetails.addControl(
            'code',
            new FormControl(''),
        );

        // When the case is saved the emergencyCaseId will change, so we'll need to validate again.
        emergencyCaseId?.valueChanges.subscribe(() => {

            const emergencyNumber = this.recordForm.get('emergencyDetails.emergencyNumber');

            emergencyNumber?.clearAsyncValidators();
            emergencyNumber?.setAsyncValidators([
                this.emergencyNumberValidator.validate(
                emergencyCaseId?.value,1)
            ]);

        });


        this.emergencyDetails.addControl('callDateTime',new FormControl(getCurrentTimeString(), Validators.required));
        this.emergencyDetails.addControl('dispatcher',new FormControl('', Validators.required));
        // this.emergencyDetails.addControl('code',new FormControl('', Validators.required));

        this.caseService
            .getEmergencyCaseById(emergencyCaseId?.value)
            .subscribe(result => {

                this.recordForm.patchValue(result);

            });

        this.recordForm
            .get('emergencyDetails.emergencyNumber')?.valueChanges.subscribe(val => {
                if(!val && this.focusEmergencyNumber){
                    this.emergencyNumberField.nativeElement.focus();
                }

                this.updateEmergencyNumber(val);
            });



    }

    ngAfterViewInit(){

        if(this.focusEmergencyNumber) {
        setTimeout(() => this.emergencyNumberField.nativeElement.focus(), 0);
        }
    }

    updateEmergencyNumber(emergencyNumber: number) {
        this.loadEmergencyNumber.emit(emergencyNumber);
    }

    // generateEmergencyNumber() {
    //     // tslint:disable-next-line:radix
    //     const value = parseInt(this.getCurrentTimeStringInSeconds());
    //     let rand: number;
    //     // tslint:disable-next-line:radix
    //     rand = Math.round((Math.random() * (10 - 1) + 1));

    //     const randomNum = Math.round((Math.random() * value * Math.random() * rand));

    //     console.log(typeof randomNum);

    //     return randomNum;

    // }

    // getCurrentTimeStringInSeconds() {
    //     let currentTime = new Date();

    //     const wn = window.navigator as any;
    //     let locale = wn.languages ? wn.languages[0] : 'en-GB';
    //     locale = locale || wn.language || wn.browserLanguage || wn.userLanguage;

    //     currentTime = new Date(
    //         currentTime.getTime() + currentTime.getTimezoneOffset(),
    //     );

    //     return formatDate(currentTime, 'hhmmSSS', locale);
        
    // }

    setInitialTime() {
        const currentTime = this.recordForm.get(
            'emergencyDetails.callDateTime',
        );

        if (!currentTime?.value) {
            currentTime?.setValue(getCurrentTimeString());
        }
    }

    compareEmergencyCodes(o1: EmergencyCode, o2: EmergencyCode): boolean{

        return o1?.EmergencyCodeId === o2?.EmergencyCodeId;
    }

    selectEmergencyCode($event:any){

        // Now we're using a selection trigger the keystroke no longer works, so we need to check for it
        this.emergencyCodes$.subscribe((codes:EmergencyCode[]) => {

            const selectedCode = codes.find((code:EmergencyCode) => {

                return code.EmergencyCode.substr(0,1).toLowerCase() === $event.key.toLowerCase();

            });

            if(selectedCode){
                this.recordForm.get('emergencyDetails.code')?.setValue(selectedCode);
            }
        });

    }


}
