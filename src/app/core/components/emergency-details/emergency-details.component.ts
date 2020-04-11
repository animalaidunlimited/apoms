import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { DropdownService } from '../../services/dropdown/dropdown.service';
import { getCurrentTimeString } from '../../utils';
import { CrossFieldErrorMatcher } from '../../../core/validators/cross-field-error-matcher';
import { CaseService } from 'src/app/modules/emergency-register/services/case.service';
import { UniqueEmergencyNumberValidator } from '../../validators/emergency-number.validator';

@Component({
  selector: 'emergency-details',
  templateUrl: './emergency-details.component.html',
  styleUrls: ['./emergency-details.component.scss']
})
export class EmergencyDetailsComponent implements OnInit {

  @Input() recordForm:FormGroup;
  @Output() public onLoadEmergencyNumber = new EventEmitter<any>();
  errorMatcher = new CrossFieldErrorMatcher();

  dispatchers$;
  emergencyCodes$
  callDateTime:string|Date = getCurrentTimeString();

  constructor(private dropdowns:DropdownService,
    private caseService:CaseService,
    private emergencyNumberValidator:UniqueEmergencyNumberValidator) { }

  ngOnInit(): void {

    this.dispatchers$ = this.dropdowns.getDispatchers();
    this.emergencyCodes$ = this.dropdowns.getEmergencyCodes();


    let emergencyDetails = this.recordForm.get("emergencyDetails") as FormGroup;

    emergencyDetails.addControl("emergencyNumber", new FormControl('', [Validators.required], [this.emergencyNumberValidator.validate(this.recordForm.get("emergencyDetails.emergencyCaseId").value)]));
    emergencyDetails.addControl("callDateTime", new FormControl(getCurrentTimeString(), Validators.required));
    emergencyDetails.addControl("dispatcher", new FormControl('', Validators.required));
    emergencyDetails.addControl("code", new FormControl('', Validators.required));

    this.caseService
    .getCaseById(this.recordForm.get("emergencyDetails.emergencyCaseId").value)
    .subscribe(result => {
      this.recordForm.patchValue(result);
    });

    this.recordForm.get("emergencyDetails.emergencyNumber").valueChanges.subscribe(val => {
      this.updateEmergencyNumber(val);
    });
  }

  updateEmergencyNumber(emergencyNumber:number){
    this.onLoadEmergencyNumber.emit(emergencyNumber);
  }

}
