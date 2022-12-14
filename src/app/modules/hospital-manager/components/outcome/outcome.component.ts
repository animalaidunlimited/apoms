import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, FormGroup, Validators } from '@angular/forms';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { getCurrentDateString } from '../../../../core/helpers/utils';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { Input } from '@angular/core';
import { Antibiotic, PatientOutcomeResponse } from 'src/app/core/models/patients';
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
    errorMatcher = new CrossFieldErrorMatcher();

    antibiotics!:Antibiotic[];
    isoReasons:any;
    maxDate: string | Date = '';
    outcomeForm:any;

    get antibioticDetails() : FormGroup { 
        return this.outcomeForm.get('antibioticDetails') as FormGroup;
    }

    get isoReason() : FormGroup { 
        return this.outcomeForm.get('isoReason') as FormGroup;
    }

    get vaccinationDetails() : FormGroup{
        return this.outcomeForm.get('vaccinationDetails') as FormGroup;
    }

    constructor(
        private fb: UntypedFormBuilder,
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

            if(!outcome)  return;

            this.outcomeForm.patchValue(outcome);
        });

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

            const outcomeResponse:PatientOutcomeResponse = await this.patientService.savePatientOutcomeForm(this.outcomeForm.value);

            outcomeResponse.success === 1 ?
            (
                this.snackbar.successSnackBar('Outcome saved successfully', 'OK'),
                this.outcomeForm.get('patientOutcomeDetailsId').setValue(outcomeResponse.patientOutcomeDetailsId)
            )   :
                this.snackbar.errorSnackBar('Outcome save failed', 'OK');

        }       

    }
}
