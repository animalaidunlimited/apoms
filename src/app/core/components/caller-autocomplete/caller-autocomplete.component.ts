import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { startWith, debounceTime, switchMap, map, catchError } from 'rxjs/operators';
import { of, Observable, BehaviorSubject } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Callers, Caller } from '../../models/responses';
import { CallerDetailsService } from '../caller-details/caller-details.service';
import { CrossFieldErrorMatcher } from '../../validators/cross-field-error-matcher';
@Component({
  selector: 'app-caller-autocomplete',
  templateUrl: './caller-autocomplete.component.html',
  styleUrls: ['./caller-autocomplete.component.scss']
})
export class CallerAutocompleteComponent implements OnInit {

  @Input() callerIndex!: number; 
  @Input() callerForm!: any;
  callerNumber!: AbstractControl | null;
  callerAutoComplete$!: Observable<any> | undefined;
  errorMatcher = new CrossFieldErrorMatcher();
  @Output() isPrimary: EventEmitter<number> = new EventEmitter();
  @Output() callerDeleted: EventEmitter<number> = new EventEmitter();


  constructor(private callerService: CallerDetailsService) { }

  ngOnInit(): void {

    this.callerNumber = this.callerForm.get('callerNumber');

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
    const callerName = this.callerForm.get('callerDetails.callerName');
    const callerNumber = this.callerForm.get('callerDetails.callerNumber');

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
    this.callerForm.valueChanges.subscribe((val:any) => {
        // The values won't have bubbled up to the parent yet, so wait for one tick
        setTimeout(() => this.updateValidators());
    });
  }

  setCallerDetails($event: MatAutocompleteSelectedEvent) {
    const caller = $event.option.value;
    this.callerForm.get('callerId')?.setValue(caller.CallerId);
    this.callerForm.get('callerNumber')?.setValue(caller.Number);
    this.callerForm.get('callerName')?.setValue(caller.Name);
    this.callerForm.get('callerAlternativeNumber')?.setValue(caller.AlternativeNumber);
  }

  removeCaller(event: Event, callerIndex: number) {
    this.callerDeleted.emit(callerIndex);
  }

  checkBox(callerIndex: number) {
    this.isPrimary.emit(callerIndex);
  } 

}
