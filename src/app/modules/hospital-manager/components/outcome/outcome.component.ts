import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { getCurrentDateString } from '../../../../core/helpers/utils';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { Input } from '@angular/core';
import { Antibiotic, PatientOutcomeResponse } from 'src/app/core/models/patients';
import { MatChip, MatChipList } from '@angular/material/chips';
import { PatientService } from 'src/app/core/services/patient/patient.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-outcome',
    templateUrl: './outcome.component.html',
    styleUrls: ['./outcome.component.scss'],
})
export class OutcomeComponent implements OnInit {

    @Input() patientId!: number;
    @ViewChild('antibiotic1Chips', { static: true }) antibiotic1Chips!: MatChipList;
    @ViewChild('antibiotic2Chips', { static: true }) antibiotic2Chips!: MatChipList;
    @ViewChild('antibiotic3Chips', { static: true }) antibiotic3Chips!: MatChipList;

    outcomeForm:any;
    antibiotics!:Antibiotic[];
    isoReasons:any;
    maxDate: string | Date = '';

    errorMatcher = new CrossFieldErrorMatcher();
    vaccinationDetails!: FormGroup;
    antibioticDetails!: FormGroup;
    isoReason!: FormGroup;


    constructor(
        private fb: FormBuilder,
        private dropdown: DropdownService,
        private snackbar: SnackbarService,
        private patientService: PatientService) {

    }

    ngOnInit() {

        this.antibiotics = this.dropdown.getAntibiotics();
        this.isoReasons = this.dropdown.getIsoReasons();
        this.maxDate = getCurrentDateString();

        this.outcomeForm = this.fb.group({
            patientOutcomeDetailsId: [],
            patientId: [this.patientId, Validators.required],
            vaccinationDetails: this.fb.group({
                megavac1Date: [],
                megavac2Date: [],
                rabiesVaccinationDate: [],
            }),
            antibioticDetails: this.fb.group({
                antibiotics1: [],
                antibiotics2: [],
                antibiotics3: [],
            }),
            isoReason: this.fb.group({
                isoReasonId: [],
            }),
        });

        this.patientService.getPatientOutcomeForm(this.patientId).pipe(take(1)).subscribe(outcome => {

            if(!outcome){
                return;
            }

            this.antibiotic1Chips.chips
                .find(chip => chip.value === this.getAntibioticId(outcome.antibioticDetails.antibiotics1))
                ?.select();

            this.antibiotic2Chips.chips
                .find(chip => chip.value === this.getAntibioticId(outcome.antibioticDetails.antibiotics2))
                ?.select();

            this.antibiotic3Chips.chips
                .find(chip => chip.value === this.getAntibioticId(outcome.antibioticDetails.antibiotics3))
                ?.select();

            this.outcomeForm.patchValue(outcome);
        });

        this.vaccinationDetails = this.outcomeForm.get('vaccinationDetails') as FormGroup;
        this.antibioticDetails = this.outcomeForm.get('antibioticDetails') as FormGroup;
        this.isoReason = this.outcomeForm.get('isoReason') as FormGroup;

    }

    getAntibioticId(antibioticId:number) : string {

        const antibioticName = this.antibiotics.find(antibiotic => antibiotic.antibioticId === antibioticId)?.antibiotic || '';

        return antibioticName;
    }

    toggleAntibioticChip(source:string, antibiotic:Antibiotic, chip: MatChip){

        if(chip.selected){

            this.antibioticDetails.get(source)?.setValue(antibiotic.antibioticId);
        }
    }

    setInitialDate($event:MouseEvent){

        const element = $event.target as HTMLElement;

        const formControlName = element.getAttribute('formControlName');

        const formControl = this.outcomeForm.get('vaccinationDetails').get(formControlName);

        if(!formControl?.value){
            formControl.setValue(getCurrentDateString());
        }

    }

    async saveOutcomeDetails(){

        if(this.outcomeForm.valid){

            const outcomeRespone:PatientOutcomeResponse = await this.patientService.savePatientOutcomeForm(this.outcomeForm.value);

            outcomeRespone.success === 1 ?
            (
                this.snackbar.successSnackBar('Outcome saved successfully', 'OK'),
                this.outcomeForm.get('patientOutcomeDetailsId').setValue(outcomeRespone.patientOutcomeDetailsId)
            )   :
                this.snackbar.errorSnackBar('Outcome save failed', 'OK');



        }

    }
}
