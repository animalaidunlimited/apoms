import { Component, OnInit, Input } from '@angular/core';
import { DropdownService } from '../../../../core/services/dropdown/dropdown.service';
import {
    FormGroup,
    Validators,
    FormBuilder,
    FormControl,
} from '@angular/forms';
import { ImageUploadDialog } from 'src/app/core/components/image-upload/image-upload.component';
import { getCurrentTimeString } from '../../../../core/helpers/utils';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { PatientService } from 'src/app/modules/emergency-register/services/patient.service';
import { CaseService } from 'src/app/modules/emergency-register/services/case.service';
import { RescueDetails } from 'src/app/core/models/responses';
import { AnimalType } from 'src/app/core/models/animal-type';

@Component({
    selector: 'patient-details',
    templateUrl: './patient-details.component.html',
    styleUrls: ['./patient-details.component.scss'],
})
export class PatientDetailsComponent implements OnInit {
    animalTypes$:AnimalType[];
    @Input() recordForm: FormGroup;
    dialog: any;
    maxDate:string;

    errorMatcher = new CrossFieldErrorMatcher();

    constructor(
        private dropdown: DropdownService,
        private patientService: PatientService,
        private fb: FormBuilder,
    ) {}

    ngOnInit() {
        this.dropdown.getAnimalTypes().subscribe(animalTypes => this.animalTypes$ = animalTypes);

        const patientDetails = this.recordForm.get(
            'patientDetails',
        ) as FormGroup;

        patientDetails.addControl(
            'animalTypeId',
            new FormControl('', Validators.required),
        );
        patientDetails.addControl(
            'mainProblems',
            new FormControl('', Validators.required),
        );
        patientDetails.addControl(
            'description',
            new FormControl('', Validators.required),
        );
        patientDetails.addControl(
            'sex',
            new FormControl('', Validators.required),
        );
        patientDetails.addControl(
            'treatmentPriority',
            new FormControl('', Validators.required),
        );
        patientDetails.addControl(
            'abcStatus',
            new FormControl('', Validators.required),
        );
        patientDetails.addControl(
            'releaseStatus',
            new FormControl('', Validators.required),
        );
        patientDetails.addControl(
            'temperament',
            new FormControl('', Validators.required),
        );

        this.maxDate = getCurrentTimeString();

        this.patientService
            .getPatientByPatientId(
                this.recordForm.get('patientDetails.patientId').value,
            )
            .subscribe(result => {
                this.recordForm.patchValue(result);
                this.recordForm
                    .get('patientDetails.animalTypeId')
                    .setValue(result.animalTypeId);
            });
    }
}
