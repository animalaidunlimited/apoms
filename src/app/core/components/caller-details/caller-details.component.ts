import { Component, OnInit, Input } from '@angular/core';
import { CrossFieldErrorMatcher } from '../../../core/validators/cross-field-error-matcher';
import { FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'caller-details',
  templateUrl: './caller-details.component.html',
  styleUrls: ['./caller-details.component.scss']
})

export class CallerDetailsComponent implements OnInit {

  @Input() recordForm: FormGroup;

  errorMatcher = new CrossFieldErrorMatcher();

  constructor() { }

  ngOnInit() {
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
}
