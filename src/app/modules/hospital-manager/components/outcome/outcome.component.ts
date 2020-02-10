import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';

@Component({
  selector: 'outcome',
  templateUrl: './outcome.component.html',
  styleUrls: ['./outcome.component.scss']
})
export class OutcomeComponent implements OnInit {

  outcomeForm;
  antibiotics;
  isoReasons;

  constructor(private fb: FormBuilder, private dropdown: DropdownService) {}

  ngOnInit() {

    this.antibiotics = this.dropdown.getAntibiotics();
    this.isoReasons = this.dropdown.getIsoReasons();

    this.outcomeForm = this.fb.group({      
      vaccinationDetails: this.fb.group({
        megavac1Date: [''],
        megavac2Date: [''],
        rabiesVaccinationDate: ['']
      }),
      antibioticDetails: this.fb.group({
        antibiotics1: [''],
        antibiotics2: [''],
        antibiotics3: [''],
      }),
      isoReason: this.fb.group({
        isoReason: [''],
      })

    })
  }

}
