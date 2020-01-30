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
  
    let complainerName = this.recordForm.get('complainerDetails.complainerName');
    let complainerNumber = this.recordForm.get('complainerDetails.complainerNumber');  
  
    if((complainerName.value || complainerNumber.value) && !(complainerName.value && complainerNumber.value))
    {
      !!complainerName.value == true  ? complainerNumber.setValidators([Validators.required])
                              : complainerName.setValidators([Validators.required]); 
    }

    complainerName.updateValueAndValidity({emitEvent: false });
    complainerNumber.updateValueAndValidity({emitEvent: false });
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
