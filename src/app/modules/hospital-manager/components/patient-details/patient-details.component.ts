import { Component, OnInit, Input, Output } from '@angular/core';
import { DropdownService } from '../../../../core/services/dropdown/dropdown.service';
import { FormGroup, Validators, FormControl, FormBuilder } from '@angular/forms';
import { getCurrentTimeString } from '../../../../core/helpers/utils';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { PatientService } from 'src/app/core/services/patient/patient.service';
import { AnimalType } from 'src/app/core/models/animal-type';
import { take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Priority } from 'src/app/core/models/priority';
import { UpdatePatientDetails } from 'src/app/core/models/patients';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { EventEmitter } from '@angular/core';


@Component({
    selector: 'patient-details',
    templateUrl: './patient-details.component.html',
    styleUrls: ['./patient-details.component.scss'],
})

export class PatientDetailsComponent implements OnInit {
    animalTypes$:AnimalType[] = [];
    @Input() recordForm!: FormGroup;
    @Output() saving: EventEmitter<boolean> = new EventEmitter(false);

    dialog: any;
    maxDate = '';

    showSaveButton = false;

    errorMatcher = new CrossFieldErrorMatcher();

    treatmentPriorities!:Observable<Priority[]>;

    constructor(
        private dropdown: DropdownService,
        private fb: FormBuilder,
        private snackBar: SnackbarService,
		private patientService: PatientService
    ) {
    }

    ngOnInit() {

        this.dropdown.getAnimalTypes().pipe(take(1)).subscribe(animalTypes => this.animalTypes$ = animalTypes);

        this.treatmentPriorities = this.dropdown.getPriority();

        const initialNumber = -1;

        const patientDetails = this.recordForm?.get(
            'patientDetails',
        ) as FormGroup;


        // If empty it means we're loading from the treatment list
        if(this.recordForm.get('patientDetails') && !patientDetails?.get('animalTypeId')) {

            patientDetails.addControl('animalTypeId',new FormControl(initialNumber, Validators.required));
            patientDetails.addControl('mainProblems',new FormControl('', Validators.required));
            patientDetails.addControl('description',new FormControl('', Validators.required));
            patientDetails.addControl('sex',new FormControl(initialNumber, Validators.required));
            patientDetails.addControl('treatmentPriority',new FormControl(initialNumber, Validators.required));
            patientDetails.addControl('abcStatus',new FormControl(initialNumber, Validators.required));
            patientDetails.addControl('releaseStatus',new FormControl(initialNumber, Validators.required));
            patientDetails.addControl('temperament',new FormControl(initialNumber, Validators.required));
            patientDetails.addControl('age',new FormControl(initialNumber, Validators.required));
            patientDetails.addControl('knownAsName',new FormControl('', Validators.required));

            this.patientService
            .getPatientByPatientId(this.recordForm.get('patientDetails.patientId')?.value)
            .pipe(take(1))
            .subscribe(result => {

                const patientDetailsControl = this.recordForm.get('patientDetails');

                if(patientDetailsControl){
                    patientDetailsControl.patchValue(result);
                    this.recordForm.get('patientDetails')?.setValue(patientDetailsControl);

                }
                else
                {
                    throw new Error('PatientDetails control is empty');
                }


            });

        }
        else {

            this.showSaveButton = true;

        }

        this.maxDate = getCurrentTimeString();

    }

    savePatientDetails(){

        this.saving.emit(true);

        const updatePatient: UpdatePatientDetails = this.recordForm.get('patientDetails')?.value;

        this.patientService.updatePatientDetails(updatePatient).then(result => {

            if(result.success === 1){

                this.saving.emit(false);

            }
            else{
                this.snackBar.errorSnackBar('Error saving patient details; pelase see admin', 'OK');
            }

          });

    }


}
