import { Component, OnInit, Input } from '@angular/core';
import { DropdownService } from '../../../../core/services/dropdown/dropdown.service';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { getCurrentTimeString } from '../../../../core/helpers/utils';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { PatientService } from 'src/app/core/services/patient/patient.service';
import { AnimalType } from 'src/app/core/models/animal-type';

@Component({
    selector: 'patient-details',
    templateUrl: './patient-details.component.html',
    styleUrls: ['./patient-details.component.scss'],
})
export class PatientDetailsComponent implements OnInit {
    animalTypes$:AnimalType[] = [];
    @Input() recordForm!: FormGroup;
    dialog: any;
    maxDate = '';

    errorMatcher = new CrossFieldErrorMatcher();

    constructor(
        private dropdown: DropdownService,
		private patientService: PatientService
    ) {}

    ngOnInit() {
        this.dropdown.getAnimalTypes().subscribe(animalTypes => this.animalTypes$ = animalTypes);

        const initialNumber = -1;

        const patientDetails = this.recordForm.get(
            'patientDetails',
        ) as FormGroup;

        patientDetails.addControl('animalTypeId',new FormControl(initialNumber, Validators.required));
        patientDetails.addControl('mainProblems',new FormControl('', Validators.required));
        patientDetails.addControl('description',new FormControl('', Validators.required));
        patientDetails.addControl('sex',new FormControl(initialNumber, Validators.required));
        patientDetails.addControl('treatmentPriority',new FormControl(initialNumber, Validators.required));
        patientDetails.addControl('abcStatus',new FormControl(initialNumber, Validators.required));
        patientDetails.addControl('releaseStatus',new FormControl(initialNumber, Validators.required));
        patientDetails.addControl('temperament',new FormControl(initialNumber, Validators.required));
        patientDetails.addControl('age',new FormControl(initialNumber, Validators.required));

        this.maxDate = getCurrentTimeString();

        this.patientService
            .getPatientByPatientId(this.recordForm.get('patientDetails.patientId')?.value)
            .subscribe(result => {
                this.recordForm.patchValue(result);

                const patientDetailsControl = this.recordForm.get('patientDetails');

                if(patientDetailsControl){
                    patientDetailsControl.patchValue(result);
                }
                else
                {
                    throw new Error('PatientDetails control is empty');
                }


            });
    }
}
