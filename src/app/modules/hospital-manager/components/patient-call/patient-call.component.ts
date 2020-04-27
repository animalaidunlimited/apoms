import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { getCurrentTimeString } from '../../../../core/utils';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { PatientService } from 'src/app/modules/emergency-register/services/patient.service';
import { MatOption } from '@angular/material/core';
import { CallType, PatientCallOutcome } from 'src/app/core/models/responses';
import { Observable } from 'rxjs';

@Component({
  selector: 'patient-call-call',
  templateUrl: './patient-call.component.html',
  styleUrls: ['./patient-call.component.scss']
})
export class PatientCallComponent implements OnInit {

  @Input() patientId:number;

  patientCallForm;

  callerHappy;
  hasVisited;
  maxDate;
  callTypes$:Observable<CallType[]>;
  callOutcomes$:Observable<PatientCallOutcome[]>;

  currentCallType:CallType;

  errorMatcher = new CrossFieldErrorMatcher();

  constructor(private fb: FormBuilder,
              private patientService: PatientService,
              private dropdown: DropdownService) {}

  ngOnInit() {



    this.maxDate = getCurrentTimeString();
    this.callTypes$ = this.dropdown.getCallTypes();
    this.callOutcomes$ = this.dropdown.getPatientCallOutcomes();

    this.patientCallForm = this.fb.group({
      patientCalls : this.fb.group({
          patientId: [this.patientId],
          calls: this.fb.array([])
      })
    });

    let calls = this.patientCallForm.get("patientCalls.calls") as FormArray;

    calls.push(this.getNewCall());

    console.log(this.patientCallForm);


  // this.callerHappy   = this.patientCallForm.get("callDetails.callerHappy");
  // this.hasVisited   = this.patientCallForm.get("callDetails.hasVisited");


  let incomingPatientId = this.patientCallForm.get("calls.patientId") as AbstractControl;

  incomingPatientId.valueChanges.subscribe(patientId =>

    this.patientService.getPatientCallCallsByPatientId(patientId).subscribe(calls =>
      this.patientCallForm.patchValue(calls))

    )

}

getNewCall(){

  return this.fb.group({
      patientId: [this.patientId],
      callTime: [''],
      callMadeBy: [''],
      callType: [],
      patientCallOutcome: []
  })



}

setInitialTime(event) {

  let currentTime;

  currentTime = this.patientCallForm.get("callDetails").get(event.target.name).value;

  if(!currentTime)
  {
    this.patientCallForm.get("callDetails").get(event.target.name).setValue(getCurrentTimeString());
  }
 }

 savePatientCallCall(){
   alert("Saving");

   this.patientCallForm.push(this.getNewCall());
 }

}