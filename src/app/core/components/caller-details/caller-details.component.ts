import { Component, OnInit, Input } from '@angular/core';
import { CrossFieldErrorMatcher } from '../../../core/validators/cross-field-error-matcher';
import {
    FormGroup,
    Validators,
    FormBuilder,
    AbstractControl,
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { Callers, Caller } from '../../models/responses';
import {
    startWith,
    debounceTime,
    switchMap,
    map,
    catchError,
    tap,
} from 'rxjs/operators';
import { CallerDetailsService } from './caller-details.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'caller-details',
    templateUrl: './caller-details.component.html',
    styleUrls: ['./caller-details.component.scss'],
})
export class CallerDetailsComponent implements OnInit {
    @Input() recordForm!: FormGroup;

    errorMatcher = new CrossFieldErrorMatcher();

    public callerAutoComplete$:any; // TODO: type this Observable<Callers>;

    callerDetails!:FormGroup;

    callerNumber!:AbstractControl|null;
    caller$!: Caller;

    constructor(
        private callerService: CallerDetailsService,
        private fb: FormBuilder,
    ) {}

    ngOnInit() {
        
        this.recordForm.addControl(
            'callerDetails',
            this.fb.group({
                callerId: [],
                callerName: ['', Validators.required],
                callerNumber: [
                    '',
                    [
                        Validators.required,
                        Validators.pattern(
                            '^[+]?[\\d\\s](?!.* {2})[ \\d]{2,15}$',
                        ),
                    ],
                ],
                callerAlternativeNumber: [
                    '',
                    Validators.pattern('^[+]?[\\d\\s](?!.* {2})[ \\d]{2,15}$'),
                ],
            }),
        );

        this.callerDetails = this.recordForm.get('callerDetails') as FormGroup;
        this.callerService
            .getCallerByEmergencyCaseId(
                this.recordForm.get('emergencyDetails.emergencyCaseId')?.value,
            )
            .subscribe((caller: Caller) => {
                this.recordForm.patchValue(caller);
            });

        this.callerNumber = this.recordForm.get('callerDetails.callerNumber');

        this.callerAutoComplete$ = this.callerNumber?.valueChanges.pipe(
            startWith(''),
            // delay emits
            debounceTime(300),
            // use switch map so as to cancel previous subscribed events, before creating new one
            switchMap(value => {
                if (value !== '' && !this.callerNumber?.pristine) {
                    return this.lookup(value);
                } else {
                    // if no value is present, return null
                    return of(null);
                }
            }),
        );
    }

    lookup(value:any): Observable<Callers|null> {
        return this.callerService.getCallerByNumber(value).pipe(
            map(
                results => results
            ),
            catchError(_ => {
                return of(null);
            })
        );
    }

    updateValidators() {
        const callerName = this.recordForm.get('callerDetails.callerName');
        const callerNumber = this.recordForm.get('callerDetails.callerNumber');

        if (
            (callerName?.value || callerNumber?.value) &&
            !(callerName?.value && callerNumber?.value)
        ) {
            !!callerName?.value === true
                ? callerNumber?.setValidators([Validators.required])
                : callerName?.setValidators([Validators.required]);
        }

        callerName?.updateValueAndValidity({ emitEvent: false });
        callerNumber?.updateValueAndValidity({ emitEvent: false });
    }

    onChanges(): void {
        this.recordForm.valueChanges.subscribe(val => {
            // The values won't have bubbled up to the parent yet, so wait for one tick
            setTimeout(() => this.updateValidators());
        });
    }

    setCallerDetails($event: MatAutocompleteSelectedEvent) {
        const caller = $event.option.value;

        this.recordForm.get('callerDetails.callerId')?.setValue(caller.CallerId);
        this.recordForm.get('callerDetails.callerNumber')?.setValue(caller.Number);
        this.recordForm.get('callerDetails.callerName')?.setValue(caller.Name);
        this.recordForm.get('callerDetails.callerAlternativeNumber')?.setValue(caller.AlternativeNumber);
    }
}
