import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef, HostListener, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { CallOutcomeResponse } from '../../../../core/models/call-outcome';
import { DropdownService } from '../../../../core/services/dropdown/dropdown.service';
import { UniqueEmergencyNumberValidator } from '../../../../core/validators/emergency-number.validator';
import { CaseService } from '../../services/case.service';
import { getCurrentTimeString } from 'src/app/core/helpers/utils';
import { UpdateResponse } from 'src/app/core/models/outstanding-case';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { takeUntil } from 'rxjs/operators';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'emergency-case-outcome',
  templateUrl: './emergency-case-outcome.component.html',
  styleUrls: ['./emergency-case-outcome.component.scss']
})
export class EmergencyCaseOutcomeComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  @Input() patientForm!: FormGroup | AbstractControl;


  @Output() public result = new EventEmitter<UpdateResponse>();

  @ViewChild('sameAsNumberField',{ read: ElementRef, static:false }) sameAsNumberField!: ElementRef;
  @ViewChild('callOutcomeField',{ read: ElementRef, static:false }) callOutcomeField!: ElementRef;

  callOutcomes$!:Observable<CallOutcomeResponse[]>;
  currentOutcomeId:number | undefined;

  errorMatcher = new CrossFieldErrorMatcher();

  sameAs:boolean | undefined;
  sameAsId:number | undefined;

  callOutcome:FormGroup = new FormGroup({});

  constructor(
    private dropdowns: DropdownService,
    private caseService: CaseService,
    private fb: FormBuilder,
    private emergencyNumberValidator:UniqueEmergencyNumberValidator,
    private changeDetector:ChangeDetectorRef
  ) {

   }


  @HostListener('document:keydown.control.o', ['$event'])
  focusCallOutcome(event: KeyboardEvent) {
      event.preventDefault();
      this.callOutcomeField?.nativeElement.focus();
  }

  ngOnInit(): void {

    this.callOutcome = this.patientForm.get('callOutcome') as FormGroup;

    if(this.patientForm.get('emergencyDetails.emergencyCaseId')?.value){

      this.caseService.getEmergencyCaseById(this.patientForm.get('emergencyDetails.emergencyCaseId')?.value)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(result =>

        this.patientForm.patchValue(result)

      );

    }

    this.callOutcomes$ = this.dropdowns.getCallOutcomes();

    this.callOutcomes$
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(callOutcome => {

      this.sameAsId = callOutcome.find(outcome => outcome.CallOutcome === 'Same as')?.CallOutcomeId;
      this.outcomeChanged();

    });

    this.patientForm.get('callOutcome.CallOutcome')?.valueChanges
    .pipe(takeUntil(this.ngUnsubscribe))
    .subscribe(() => {

      this.outcomeChanged();

    });

    this.changeDetector.detectChanges();
  }

  ngOnDestroy() {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
  }

  outcomeChanged(){

    const sameAsNumber = this.patientForm.get('callOutcome.sameAsNumber');
    const callOutcomeId = this.patientForm.get('callOutcome.CallOutcome')?.value?.CallOutcomeId;
    const patientArray = (this.patientForm.parent as FormGroup).parent?.get('patients') as FormArray;
    // Check if we need to show the same as field.
    this.sameAs = this.sameAsId === callOutcomeId;

    if(!sameAsNumber?.value && this.sameAs){
      sameAsNumber?.setValidators(Validators.required);
      sameAsNumber?.setAsyncValidators([this.emergencyNumberValidator.validate(this.patientForm.get('emergencyDetails.emergencyCaseId')?.value, 0)]);
    }

    // We might have selected something other than Same As, so hide the field.
    if(!this.sameAs){
      sameAsNumber?.setValue(null);
      sameAsNumber?.clearValidators();
      sameAsNumber?.clearAsyncValidators();
    }

    sameAsNumber?.updateValueAndValidity();

    /**
     * At current index if patient outcome is admissions
     * change only outcome which is blank in outcome array to admission
     */
    if(callOutcomeId === 1){
      patientArray?.controls.forEach(patient => {
        /**
         * check for call outcome number
         * if blank then set them to admission
         */
        if(isNaN(patient.get('callOutcome.CallOutcome')?.value?.CallOutcomeId) || patient.get('callOutcome.CallOutcome')?.value?.CallOutcomeId === 1){
          patient.get('callOutcome.CallOutcome')?.setValue({
              CallOutcomeId : callOutcomeId,
              CallOutcome: 'Admission'
          }, {emitEvent: false});
          patient?.get('tagNumber')?.setValidators(Validators.required);
          patient?.get('tagNumber')?.updateValueAndValidity();

          patient?.get('isAdmission')?.setValue(true ,{ emitEvent: false });
          patient?.get('isAdmission')?.updateValueAndValidity({ emitEvent: false });

          patient?.get('admissionArea')?.setValidators(Validators.required); 
          patient?.get('admissionArea')?.updateValueAndValidity({ emitEvent: false });
        }
        

      });
      

    }
    else {
      /**
       * At current index if patient outcome is not admisson
       * reset only current outcome form not even those who has been updated 
       * previously programmatically  
       */
      this.patientForm?.get('isAdmission')?.setValue(false, { emitEvent: false });
      this.patientForm?.get('isAdmission')?.updateValueAndValidity({ emitEvent: false });
      
      this.patientForm?.get('tagNumber')?.clearValidators();
      this.patientForm?.get('tagNumber')?.updateValueAndValidity({ emitEvent: false });

      this.patientForm?.get('admissionArea')?.clearValidators();
      this.patientForm?.get('admissionArea')?.updateValueAndValidity({ emitEvent: false }); 

    }



    this.changeDetector.detectChanges();

    // Make sure we focus when we're selecting same as
    if(this.sameAs){
      this.changeDetector.detectChanges();
    }

  }

  async save(){

    // If we haven't touched the form, don't do anything.
    if(this.patientForm.get('callOutcome')?.pristine || !this.patientForm.get('callOutcome')?.value){

      const emptyResult:UpdateResponse = {
        success: 1,
        socketEndPoint: ''
      };

      this.result.emit(emptyResult);
      return;
    }

    const updateTime = getCurrentTimeString();

    (this.patientForm.get('callOutcome') as FormGroup)
          .addControl('updateTime', new FormControl(updateTime));

    const updateRecord:FormGroup = this.fb.group({
      emergencyForm: [this.patientForm.value]
    });

    await this.caseService.updateCaseOutcome(updateRecord.value).then((data:any) => this.result.emit(data));
  }

  compareCallOutcome(outcome1: CallOutcomeResponse, outcome2: CallOutcomeResponse){

    return outcome1?.CallOutcomeId === outcome2?.CallOutcomeId;

  }


}
