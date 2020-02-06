import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'outcome',
  templateUrl: './outcome.component.html',
  styleUrls: ['./outcome.component.scss']
})
export class OutcomeComponent implements OnInit {

  outcomeForm;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {

    this.outcomeForm = this.fb.group({

      outcomeDetails: this.fb.group({

      })

    })
  }

}
