import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators, AbstractControl, FormArray, FormGroup, FormGroupDirective, FormControl } from '@angular/forms';
import { getCurrentTimeString } from '../../../../core/utils';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { PatientService } from 'src/app/modules/emergency-register/services/patient.service';
import { CallType, PatientCallOutcome } from 'src/app/core/models/responses';
import { Observable } from 'rxjs';
import { User } from 'src/app/core/models/user';

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

  assignedTo$:Observable<User[]>;

  currentCallType:CallType;

  errorMatcher = new CrossFieldErrorMatcher();

  constructor(private fb: FormBuilder,
              private patientService: PatientService,
              private dropdown: DropdownService) {}

  calls:FormArray;

  ngOnInit() {

    this.assignedTo$ = this.dropdown.getCallStaff();

    this.maxDate = getCurrentTimeString();
    this.callTypes$ = this.dropdown.getCallTypes();
    this.callOutcomes$ = this.dropdown.getPatientCallOutcomes();

    this.patientCallForm = this.fb.group({
          calls: this.fb.array([])
    });

    this.calls = this.patientCallForm.get("calls");

    this.calls.push(this.getNewCall());

  // this.hasVisited   = this.patientCallForm.get("callDetails.hasVisited");

  // let incomingPatientId = this.patientCallForm.get("patientCalls.patientId") as AbstractControl;

  // incomingPatientId.valueChanges.subscribe(patientId => {

  //   if(patientId > 0){

  //     this.patientService.getPatientCallCallsByPatientId(patientId).subscribe(calls =>
  //       this.patientCallForm.patchValue(calls))
  //   }
  // });
}

getNewCall(){

  return this.fb.group({
      patientCallId: [],
      patientId: [this.patientId],
      positiveCallOutcome: [''],
      callTime: [''],
      assignedTo: [''],
      callType: [],
      patientCallOutcome: [],
      createdDate: [''],
      createdBy: [''],
      comments: [''],
      updated: [true]
  })
}

setInitialTime(element:string, index:number) {

  let currentCall:FormGroup = this.patientCallForm.get("patientCalls.calls").controls[index] as FormGroup;

  let currentElement:AbstractControl = currentCall.get(element);

  let currentTime:string|Date = currentElement.value;

  if(!currentTime)
  {
    currentElement.setValue(getCurrentTimeString());
  }
 }

 savePatientCall(){
   this.patientService.savePatientCalls(this.patientCallForm.value);
 }

 addPatientCall(){

  this.calls.push(this.getNewCall());

 }



}