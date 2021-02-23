import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { getCurrentDateString } from 'src/app/core/helpers/utils';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { PatientService } from 'src/app/core/services/patient/patient.service';
import { take } from 'rxjs/operators';

@Component({
    selector: 'cruelty-details',
    templateUrl: './cruelty-details.component.html',
    styleUrls: ['./cruelty-details.component.scss'],
})
export class CrueltyDetailsComponent implements OnInit {

    @Input() patientId!: number;

    crueltyForm: FormGroup = new FormGroup({});
    crueltyInspectors$:any;

    errorMatcher = new CrossFieldErrorMatcher();

    crueltyDetails:FormGroup = new FormGroup({});

    maxDate = getCurrentDateString();

    constructor(
        private fb: FormBuilder,
        private dropdowns: DropdownService,
        private snackbar: SnackbarService,
        private patientService: PatientService) {
    }

    ngOnInit() {

        this.crueltyInspectors$ = this.dropdowns.getCrueltyInspectors();

        this.crueltyForm = this.fb.group({
            crueltyDetails: this.fb.group({
                crueltyReportId: [],
                patientId: [this.patientId, Validators.required],
                crueltyReport: ['', Validators.required],
                crueltyDate: ['', Validators.required],
                postCrueltyReport: [],
                crueltyCode: [],
                animalCondition: [],
                crueltyInspector: [, Validators.required],
                nameOfAccused: [],
                mobileNumberOfAccused: [],
                firNumber: [],
                act: [],
                policeComplaintNumber: [],
                policeStation: [],
                policeOfficerName: [],
                policeOfficerDesignation: [],
                policeOfficerNumber: [],
                actionTaken: [],
                animalLocationAfterAction: []
            }),
        });

        this.crueltyDetails = this.crueltyForm.get('crueltyDetails') as FormGroup;

        this.patientService.getCrueltyForm(this.patientId).pipe(take(1)).subscribe(crueltyData => {

            this.crueltyDetails.patchValue(crueltyData);

        });
    }

    setInitialTime(event:any){

        const currentTime = this.crueltyForm.get(event.target.name)?.value;

        if(!currentTime)
        {
          this.crueltyForm.get(event.target.name)?.setValue(getCurrentDateString());
        }
    }

    async saveForm(){

        if(this.crueltyForm.valid){

            const result = await this.patientService.saveCrueltyForm(this.crueltyForm.get('crueltyDetails')?.value);

            result.success === 1 ?
            this.snackbar.successSnackBar('Save successful', 'OK') :
            this.snackbar.errorSnackBar('Save failed','OK');

            this.crueltyForm.get('crueltyDetails.crueltyReportId')?.setValue(result.crueltyReportId);

        }


    }
}
