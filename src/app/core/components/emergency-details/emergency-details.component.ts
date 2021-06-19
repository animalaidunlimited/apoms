import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, HostListener, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { DropdownService } from '../../services/dropdown/dropdown.service';
import { getCurrentTimeString } from '../../helpers/utils';
import { CrossFieldErrorMatcher } from '../../../core/validators/cross-field-error-matcher';
import { CaseService } from 'src/app/modules/emergency-register/services/case.service';
import { UniqueEmergencyNumberValidator } from '../../validators/emergency-number.validator';
import { UserOptionsService } from '../../services/user-option/user-options.service';
import { DatePipe } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { User } from '../../models/user';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';


@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'emergency-details',
    templateUrl: './emergency-details.component.html',
    styleUrls: ['./emergency-details.component.scss'],
})
export class EmergencyDetailsComponent implements OnInit, AfterViewInit, OnDestroy {

    private ngUnsubscribe = new Subject();

    @Input() recordForm!: FormGroup;
    @Input() focusEmergencyNumber!: boolean;
    @Output() public loadEmergencyNumber = new EventEmitter<any>();
    errorMatcher = new CrossFieldErrorMatcher();

    @ViewChild('emergencyNumber',{ read: ElementRef, static:true }) emergencyNumberField!: ElementRef;
    @ViewChild('callDateTimeField',{ read: ElementRef, static:true }) callDateTimeField!: ElementRef;
    @ViewChild('dispatcher',{ read: ElementRef, static:true }) dispatcher!: ElementRef;

    dispatchers$!: Observable<User[]>;
    callDateTime: string = getCurrentTimeString();
    minimumDate = '2018-02-14T00:00';

    hasEmergencyCaseId: number | undefined = undefined;

    emergencyDetails!: FormGroup;

    constructor(
        private dropdowns: DropdownService,
        private caseService: CaseService,
        private datePipe: DatePipe,
        private userOptions: UserOptionsService,
        private emergencyNumberValidator: UniqueEmergencyNumberValidator,
        public dialog: MatDialog,
        private cdr: ChangeDetectorRef
    ) {}

    @HostListener('document:keydown.control.shift.c', ['$event'])
    focusCallDateTime(event: KeyboardEvent) {
        event.preventDefault();
        this.callDateTimeField?.nativeElement.focus();
    }

    @HostListener('document:keydown.control.d', ['$event'])
    focusCallDispatcher(event: KeyboardEvent) {
        event.preventDefault();
        this.dispatcher?.nativeElement.focus();
    }

    ngOnInit(): void {
        this.dispatchers$ = this.dropdowns.getDispatchers();

        this.minimumDate =
            this.datePipe.transform(
                this.userOptions.getMinimumDate(),
                'yyyy-MM-ddThh:mm:ss.ms',
            ) || '';

        this.emergencyDetails = this.recordForm.get(
            'emergencyDetails',
        ) as FormGroup;

        const emergencyCaseId = this.recordForm.get('emergencyDetails.emergencyCaseId');

        this.addFormControls();

        // When the case is saved the emergencyCaseId will change, so we'll need to validate again.
        emergencyCaseId?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {

            const emergencyNumber = this.recordForm.get('emergencyDetails.emergencyNumber');

            emergencyNumber?.clearAsyncValidators();
            emergencyNumber?.setAsyncValidators([this.emergencyNumberValidator.validate(emergencyCaseId?.value,1)]);

        });

        this.caseService
            .getEmergencyCaseById(emergencyCaseId?.value)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(result => {
                this.recordForm.patchValue(result);
            });

        this.recordForm
            .get('emergencyDetails.emergencyNumber')?.valueChanges
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(val => {
                if(!val && this.focusEmergencyNumber){
                    this.emergencyNumberField?.nativeElement.focus();
                }

                this.updateEmergencyNumber(val);
            });
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    ngAfterViewInit(){

        if(this.focusEmergencyNumber) {
        setTimeout(() => this.emergencyNumberField?.nativeElement.focus(), 0);
        }
    }

    private addFormControls() {
        this.emergencyDetails.addControl('emergencyNumber',
            new FormControl(
                '',
                [Validators.required],
                [this.emergencyNumberValidator.validate(this.recordForm.get('emergencyDetails.emergencyCaseId')?.value, 1)]
            )
        );

        this.emergencyDetails.addControl('callDateTime',new FormControl(getCurrentTimeString(), Validators.required));
        this.emergencyDetails.addControl('dispatcher',new FormControl('', Validators.required));
        this.emergencyDetails.addControl('code',new FormControl());
    }

    updateEmergencyNumber(emergencyNumber: number) {
        this.loadEmergencyNumber.emit(emergencyNumber);
    }

}
