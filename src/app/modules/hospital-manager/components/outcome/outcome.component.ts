import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { getCurrentTimeString } from '../../../../core/helpers/utils';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';

@Component({
    selector: 'app-outcome',
    templateUrl: './outcome.component.html',
    styleUrls: ['./outcome.component.scss'],
})
export class OutcomeComponent implements OnInit {
    outcomeForm:any;
    antibiotics:any;
    isoReasons:any;
    maxDate: string | Date = '';

    errorMatcher = new CrossFieldErrorMatcher();
    vaccinationDetails!: FormGroup;
    antibioticDetails!: FormGroup;
    isoReason!: FormGroup;


    constructor(private fb: FormBuilder, private dropdown: DropdownService) {

    }

    ngOnInit() {

        this.antibiotics = this.dropdown.getAntibiotics();
        this.isoReasons = this.dropdown.getIsoReasons();
        this.maxDate = getCurrentTimeString();

        this.outcomeForm = this.fb.group({
            vaccinationDetails: this.fb.group({
                megavac1Date: [''],
                megavac2Date: [''],
                rabiesVaccinationDate: [''],
            }),
            antibioticDetails: this.fb.group({
                antibiotics1: [''],
                antibiotics2: [''],
                antibiotics3: [''],
            }),
            isoReason: this.fb.group({
                isoReason: [''],
            }),
        });

        this.vaccinationDetails = this.outcomeForm.get('vaccinationDetails') as FormGroup;
        this.antibioticDetails = this.outcomeForm.get('antibioticDetails') as FormGroup;
        this.isoReason = this.outcomeForm.get('isoReason') as FormGroup;


    }



    cycleChips($event:any){

    }

    toggleAntibioticChip(antibiotic:any){

    }
}
