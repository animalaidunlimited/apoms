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

  CallerNumber;

  constructor(private callerSearchService: CallerSearchService) { }

  options: string[] = ['One', 'Two', 'Three'];

  ngOnInit() {

    this.CallerNumber = this.recordForm.get('CallerDetails.CallerNumber');

    this.callerAutoComplete$ = this.CallerNumber.valueChanges.pipe(
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
    return this.callerSearchService.getCallerByNumber(value.toLowerCase()).pipe(
      // map the item property of the github results as our return object
      map(results =>
        //console.log(JSON.stringify(results.data))
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

    let CallerName = this.recordForm.get('CallerDetails.CallerName');
    let CallerNumber = this.recordForm.get('CallerDetails.CallerNumber');



    if((CallerName.value || CallerNumber.value) && !(CallerName.value && CallerNumber.value))
    {
      !!CallerName.value == true  ? CallerNumber.setValidators([Validators.required])
                              : CallerName.setValidators([Validators.required]);
    }

    CallerName.updateValueAndValidity({emitEvent: false });
    CallerNumber.updateValueAndValidity({emitEvent: false });
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

    this.recordForm.get('CallerDetails.CallerId').setValue(caller.CallerId);
    this.recordForm.get('CallerDetails.CallerNumber').setValue(caller.Number);
    this.recordForm.get('CallerDetails.CallerName').setValue(caller.Name);
    this.recordForm.get('CallerDetails.CallerAlternativeNumber').setValue(caller.AlternativeNumber);


  }


}
