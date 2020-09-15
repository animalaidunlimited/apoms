import { Component, OnInit, Input, Output, EventEmitter, ViewChildren, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { DropdownService } from '../../services/dropdown/dropdown.service';
import { getCurrentTimeString } from '../../helpers/utils';
import { CrossFieldErrorMatcher } from '../../../core/validators/cross-field-error-matcher';
import { CaseService } from 'src/app/modules/emergency-register/services/case.service';
import { UniqueEmergencyNumberValidator } from '../../validators/emergency-number.validator';
import { UserOptionsService } from '../../services/user-options.service';
import { DatePipe } from '@angular/common';
import { EmergencyCode } from '../../models/emergency-record';

@Component({
    selector: 'emergency-details',
    templateUrl: './emergency-details.component.html',
    styleUrls: ['./emergency-details.component.scss'],
})
export class EmergencyDetailsComponent implements OnInit {

    @Input() recordForm: FormGroup;
    @Output() public onLoadEmergencyNumber = new EventEmitter<any>();
    errorMatcher = new CrossFieldErrorMatcher();

    @ViewChild("emergencyNumber",{ read: ElementRef, static:true }) emergencyNumberField: ElementRef;
    @ViewChild("callDateTimeField",{ read: ElementRef, static:true }) callDateTimeField: ElementRef;

    @HostListener('document:keydown.control.shift.c', ['$event'])
    focusCallDateTime(event: KeyboardEvent) {
        event.preventDefault();
        this.callDateTimeField.nativeElement.focus();
    };

    dispatchers$;
    emergencyCodes$;
    callDateTime: string | Date = getCurrentTimeString();
    minimumDate: string;

    emergencyDetails: FormGroup;

    selected;

    constructor(
        private dropdowns: DropdownService,
        private caseService: CaseService,
        private datePipe: DatePipe,
        private userOptions: UserOptionsService,
        private emergencyNumberValidator: UniqueEmergencyNumberValidator,
    ) {}

    ngOnInit(): void {
        this.dispatchers$ = this.dropdowns.getDispatchers();
        this.emergencyCodes$ = this.dropdowns.getEmergencyCodes();

        this.minimumDate = this.datePipe.transform(this.userOptions.getMinimumDate(), "yyyy-MM-ddThh:mm:ss.ms");

        this.emergencyDetails = this.recordForm.get(
            'emergencyDetails',
        ) as FormGroup;



        this.emergencyDetails.addControl(
            'emergencyNumber',
            new FormControl(
                '',
                [Validators.required],
                [
                    this.emergencyNumberValidator.validate(
                        this.recordForm.get('emergencyDetails.emergencyCaseId')
                            .value,
                        1,
                    ),
                ],
            ),
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
            new FormControl('', Validators.required),
        );

        this.caseService
            .getEmergencyCaseById(
                this.recordForm.get('emergencyDetails.emergencyCaseId').value,
            )
            .subscribe(result => {

                this.recordForm.patchValue(result);

            });

        this.recordForm
            .get('emergencyDetails.emergencyNumber')
            .valueChanges.subscribe(val => {
                if(!val){
                    this.emergencyNumberField.nativeElement.focus();
                }

                this.updateEmergencyNumber(val);
            });
    }

    ngAfterViewInit(){

        setTimeout(() => this.emergencyNumberField.nativeElement.focus(), 0);
    }

    updateEmergencyNumber(emergencyNumber: number) {
        this.onLoadEmergencyNumber.emit(emergencyNumber);
    }

    setInitialTime() {
        const currentTime = this.recordForm.get(
            'emergencyDetails.callDateTime',
        );

        if (!currentTime.value) {
            currentTime.setValue(getCurrentTimeString());
        }
    }

    compareEmergencyCodes(o1: EmergencyCode, o2: EmergencyCode): boolean{

        return o1?.EmergencyCodeId === o2?.EmergencyCodeId;
    }

    selectEmergencyCode($event){

        //Now we're using a selection trigger the keystroke no longer works, so we need to check for it
        this.emergencyCodes$.subscribe((codes:EmergencyCode[]) => {

            let selectedCode = codes.find((code:EmergencyCode) => {

                return code.EmergencyCode.substr(0,1).toLowerCase() === $event.key.toLowerCase();

            });

            if(selectedCode){
                this.recordForm.get("emergencyDetails.code").setValue(selectedCode);
            }
        })

    }


}
