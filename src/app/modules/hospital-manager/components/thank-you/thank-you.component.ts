import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'thank-you-call',
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.scss']
})
export class ThankYouComponent implements OnInit {

  thankYouForm;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {

    this.thankYouForm = this.fb.group({

      callDetails: this.fb.group({
        call1Time: ['', Validators.required],
        call1MadeBy: [, Validators.required],
        call1Outcome: ['', Validators.required],
        call2Time: ['', Validators.required],
        call2MadeBy: [, Validators.required],
        call2Outcome: ['', Validators.required],
        call3Time: ['', Validators.required],
        call3MadeBy: [, Validators.required],
        call3Outcome: ['', Validators.required],
      })
  })

}

}