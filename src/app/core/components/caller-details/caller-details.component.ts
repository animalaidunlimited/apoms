import { Component, OnInit, Input } from '@angular/core';
import { CrossFieldErrorMatcher } from '../../../core/validators/cross-field-error-matcher';
import { FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { Callers } from '../../models/responses';
import { startWith, debounceTime, switchMap, map, catchError, tap } from 'rxjs/operators';
import { CallerSearchService } from 'src/app/pages/modules/emergency-register/services/caller-search.service';

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

  constructor(private callerSearchService: CallerSearchService) { }

  options: string[] = ['One', 'Two', 'Three'];

  ngOnInit() {

    this.callerNumber = this.recordForm.get('callerDetails.callerNumber');

    this.callerAutoComplete$ = this.callerNumber.valueChanges.pipe(
      startWith(''),
      // delay emits
      debounceTime(300),
      // use switch map so as to cancel previous subscribed events, before creating new one
      switchMap(value => {
        if (value !== '') {
          console.log("value: " + value);
          return this.lookup(value);
          //return this.lookup(value);
        } else {
          // if no value is present, return null
          return of(null);
        }
      })
    )
    //.subscribe(callerAutoComplete => this.callerAutoComplete$ = callerAutoComplete);
  }

  lookup(value): Observable<Callers> {
    return this.callerSearchService.getCallerByNumber(value).pipe(
      // map the item property of the github results as our return object
      map(results =>
        //console.log(JSON.stringify(results))
        results.data
        ),
      // catch errors
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
