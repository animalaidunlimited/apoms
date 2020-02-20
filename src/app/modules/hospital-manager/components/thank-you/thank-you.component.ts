import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { getCurrentTimeString } from '../../../../core/utils';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';

@Component({
  selector: 'thank-you-call',
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.scss']
})
export class ThankYouComponent implements OnInit {

  thankYouForm;

  callerHappy;
  hasVisited;
  maxDate;
  officeStaff;

  errorMatcher = new CrossFieldErrorMatcher();

  constructor(private fb: FormBuilder,
              private dropdown: DropdownService) {}

  ngOnInit() {

    this.maxDate = getCurrentTimeString();
    this.officeStaff = this.dropdown.getOfficeStaff();

    this.thankYouForm = this.fb.group({

      callDetails: this.fb.group({
        call1Time: ['', Validators.required],
        call1MadeBy: ['', Validators.required],
        call1Outcome: ['', Validators.required],
        call2Time: [''],
        call2MadeBy: [''],
        call2Outcome: [''],
        call3Time: [''],
        call3MadeBy: [''],
        call3Outcome: [''],
        callerHappy: [''],
        fullAddress: [''],
        area: [''],
        emailAddress: [''],
        hasVisited: [''],


      })
  });

  this.callerHappy   = this.thankYouForm.get("callDetails.callerHappy");
  this.hasVisited   = this.thankYouForm.get("callDetails.hasVisited");

}

}