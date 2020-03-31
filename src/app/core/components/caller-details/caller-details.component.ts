import { Component, OnInit, Input } from '@angular/core';
import { CrossFieldErrorMatcher } from '../../../core/validators/cross-field-error-matcher';
import { FormGroup, Validators, FormControl, AbstractControl, FormBuilder } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { Callers, Caller } from '../../models/responses';
import { startWith, debounceTime, switchMap, map, catchError, tap } from 'rxjs/operators';
import { CallerDetailsService } from './caller-details.service';

@Component({
  selector: 'caller-details',
  templateUrl: './caller-details.component.html',
  styleUrls: ['./caller-details.component.scss']
})

export class CallerDetailsComponent implements OnInit {

  @Input() recordForm: FormGroup;

  errorMatcher = new CrossFieldErrorMatcher();

  public callerAutoComplete$;//TODO: type this Observable<Callers>;

  callerNumber;
  caller$:Caller;

  constructor(
    private callerService: CallerDetailsService,
    private fb: FormBuilder) { }

  ngOnInit() {

    this.recordForm.addControl(
      "callerDetails", this.fb.group({
        callerId: [],
        callerName: ["", Validators.required],
        callerNumber: ["", Validators.required],
        callerAlternativeNumber: [""]
      })
    );


    this.callerService.getCallerByEmergencyCaseId(this.recordForm.get("emergencyDetails.emergencyCaseId").value)
    .subscribe((caller: Caller) => {

      this.recordForm.patchValue(caller);
    });

    this.callerNumber = this.recordForm.get('callerDetails.callerNumber');

    this.callerAutoComplete$ = this.callerNumber.valueChanges.pipe(
      startWith(''),
      // delay emits
      debounceTime(300),
      // use switch map so as to cancel previous subscribed events, before creating new one
      switchMap(value => {
        if (value !== '') {
          return this.lookup(value);
        } else {
          // if no value is present, return null
          return of(null);
        }
      })
    )
  }

  lookup(value): Observable<Callers> {
    return this.callerService.getCallerByNumber(value).pipe(
      map(results =>
        // console.log(results)
        results
        ),
      catchError(_ => {
        return of(null);
      })
    );
}

  updateValidators()
  {

    let callerName = this.recordForm.get('callerDetails.callerName');
    let callerNumber = this.recordForm.get('callerDetails.callerNumber');

    if((callerName.value || callerNumber.value) && !(callerName.value && callerNumber.value))
    {
      !!callerName.value == true  ? callerNumber.setValidators([Validators.required])
                              : callerName.setValidators([Validators.required]);
    }

    callerName.updateValueAndValidity({emitEvent: false });
    callerNumber.updateValueAndValidity({emitEvent: false });
  }


  onChanges(): void {

    this.recordForm.valueChanges.subscribe(val => {

      //The values won't have bubbled up to the parent yet, so wait for one tick
      setTimeout(() =>
        this.updateValidators()
      )

    });
  }

  setCallerDetails($event)
  {
    let caller = $event.option.value;

    this.recordForm.get('callerDetails.callerId').setValue(caller.CallerId);
    this.recordForm.get('callerDetails.callerNumber').setValue(caller.Number);
    this.recordForm.get('callerDetails.callerName').setValue(caller.Name);
    this.recordForm.get('callerDetails.callerAlternativeNumber').setValue(caller.AlternativeNumber);

  }
}
