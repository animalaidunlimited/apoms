import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Observable } from 'rxjs';
import { CallOutcomeResponse } from '../../../../core/models/call-outcome';
import { DropdownService } from '../../../../core/services/dropdown/dropdown.service';
import { UniqueEmergencyNumberValidator } from '../../../../core/validators/emergency-number.validator';
import { CaseService } from '../../services/case.service';
import { getCurrentTimeString } from 'src/app/core/helpers/utils';
import { UpdateResponse } from 'src/app/core/models/outstanding-case';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { take } from 'rxjs/operators';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'emergency-case-outcome',
  templateUrl: './emergency-case-outcome.component.html',
  styleUrls: ['./emergency-case-outcome.component.scss']
})
export class EmergencyCaseOutcomeComponent implements OnInit {

  @Input() recordForm!: FormGroup;
  @Output() public result = new EventEmitter<UpdateResponse>();
  @ViewChild('sameAsNumberField',{ read: ElementRef, static:false }) sameAsNumberField!: ElementRef;

  errorMatcher = new CrossFieldErrorMatcher();

  callOutcomes$!:Observable<CallOutcomeResponse[]>;
  currentOutcomeId:number | undefined;

  sameAs:boolean | undefined;
  sameAsId:number | undefined;

  callOutcome:FormGroup = new FormGroup({});

  constructor(
    private dropdowns: DropdownService,
    private caseService: CaseService,
    private fb: FormBuilder,
    private emergencyNumberValidator:UniqueEmergencyNumberValidator,
    private changeDetector:ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    this.callOutcome = this.recordForm.get('callOutcome') as FormGroup;

    if(this.recordForm.get('emergencyDetails.emergencyCaseId')?.value){

      this.caseService.getEmergencyCaseById(this.recordForm.get('emergencyDetails.emergencyCaseId')?.value).pipe(take(1)).subscribe(result =>

        this.recordForm.patchValue(result)

        );

    }

    this.callOutcomes$ = this.dropdowns.getCallOutcomes();

    this.callOutcomes$.pipe(take(1)).subscribe(callOutcome => {

      this.sameAsId = callOutcome.find(outcome => outcome.CallOutcome === 'Same as')?.CallOutcomeId;

    });

    this.recordForm.get('callOutcome.CallOutcome')?.valueChanges.subscribe(() => {

      this.outcomeChanged();

    });

    this.changeDetector.detectChanges();
  }

  outcomeChanged(){

    const sameAsNumber = this.recordForm.get('callOutcome.sameAsNumber');
    const callOutcomeId = this.recordForm.get('callOutcome.CallOutcome')?.value?.CallOutcomeId;

    // Check if we need to show the same as field.
    this.sameAs = this.sameAsId === callOutcomeId;

    if(!sameAsNumber?.value && this.sameAs){
      sameAsNumber?.setValidators(Validators.required);
      sameAsNumber?.setAsyncValidators([this.emergencyNumberValidator.validate(this.recordForm.get('emergencyDetails.emergencyCaseId')?.value, 0)]);
    }

    // We might have selected something other than Same As, so hide the field.
    if(!this.sameAs){
      sameAsNumber?.setValue(null);
      sameAsNumber?.clearValidators();
      sameAsNumber?.clearAsyncValidators();
    }

    sameAsNumber?.updateValueAndValidity();

    const patientArray = this.recordForm.get('patients') as FormArray;

    if(callOutcomeId === 1){

      // If we're selecting admission, check to make sure all of the animals have a TagNumber
      patientArray?.controls.forEach(patient => {

        patient?.get('tagNumber')?.setValidators(Validators.required);
        patient?.get('tagNumber')?.updateValueAndValidity();
      });

    }
    else {

      patientArray?.controls.forEach(patient => {

        patient?.get('tagNumber')?.clearValidators();
        patient?.get('tagNumber')?.updateValueAndValidity();
      });

    }



    this.changeDetector.detectChanges();

    // Make sure we focus when we're selecting same as
    if(this.sameAs){
      setTimeout(() => this.sameAsNumberField.nativeElement.focus(), 0);
      this.changeDetector.detectChanges();
    }

  }

  async save(){

    // If we haven't touched the form, don't do anything.
    if(this.recordForm.get('callOutcome')?.pristine || !this.recordForm.get('callOutcome')?.value){

      const emptyResult:UpdateResponse = {
        success: 1,
        socketEndPoint: ''
      };

      this.result.emit(emptyResult);
      return;
    }

    const updateTime = getCurrentTimeString();

    (this.recordForm.get('callOutcome') as FormGroup)
          .addControl('updateTime', new FormControl(updateTime));

    const updateRecord:FormGroup = this.fb.group({
      emergencyForm: [this.recordForm.value]
    });

    await this.caseService.updateCaseOutcome(updateRecord.value).then((data:any) => this.result.emit(data));
  }

  compareCallOutcome(outcome1: CallOutcomeResponse, outcome2: CallOutcomeResponse){

    return outcome1?.CallOutcomeId === outcome2?.CallOutcomeId;

  }


}
