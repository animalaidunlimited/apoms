import { Component, OnInit, Input } from '@angular/core';
import { DropdownService } from '../../../../core/services/dropdown/dropdown.service'
import { FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';
import { ImageUploadDialog } from 'src/app/core/components/image-upload/image-upload.component';
import { getCurrentTimeString } from '../../../../core/utils';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { PatientService } from 'src/app/modules/emergency-register/services/patient.service';
import { CaseService } from 'src/app/modules/emergency-register/services/case.service';
import { RescueDetails } from 'src/app/core/models/responses';

@Component({
  selector: 'patient-details',
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.scss']
})
export class PatientDetailsComponent implements OnInit {


  animalTypes$;
  @Input() recordForm: FormGroup;
  dialog: any;
  maxDate;

  errorMatcher = new CrossFieldErrorMatcher();

  constructor(private dropdown: DropdownService,
    private patientService: PatientService,
    private fb: FormBuilder,
    private caseService: CaseService) { }

  ngOnInit() {

    this.dropdown.getAnimalTypes().subscribe(animalTypes => this.animalTypes$ = animalTypes);

    let patientDetails = this.recordForm.get("patientDetails") as FormGroup;

    patientDetails.addControl("animalTypeId", new FormControl('', Validators.required));
    patientDetails.addControl("mainProblems", new FormControl('', Validators.required));
    patientDetails.addControl("description", new FormControl('', Validators.required));
    patientDetails.addControl("sex", new FormControl('', Validators.required));


    let emergencyDetails = this.recordForm.get("emergencyDetails") as FormGroup;
    emergencyDetails.addControl("emergencyNumber", new FormControl('', Validators.required));


    this.recordForm.addControl(
      "rescueDetails", this.fb.group({
        "admissionTime" : ['', Validators.required]
    }));

    this.maxDate = getCurrentTimeString();

    this.caseService
    .getCaseById(this.recordForm.get("emergencyDetails.emergencyCaseId").value)
    .subscribe(result => {
      // console.log(result);
      this.recordForm.patchValue(result);
    });

    this.patientService
    .getPatientByPatientId(this.recordForm.get("patientDetails.patientId").value)
    .subscribe(result => {
      this.recordForm.patchValue(result);
      this.recordForm.get("patientDetails.animalTypeId").setValue(result.animalTypeId)
    });

    this.caseService.getRescueDetailsByEmergencyCaseId(this.recordForm.get("emergencyDetails.emergencyCaseId").value)
    .subscribe((rescueDetails: RescueDetails) => {
      // console.log(rescueDetails);
      this.recordForm.patchValue(rescueDetails);

    });

    console.log(this.recordForm);


  }



}
