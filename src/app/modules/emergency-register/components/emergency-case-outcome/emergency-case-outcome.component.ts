import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, AbstractControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { CallOutcomeResponse } from '../../../../core/models/call-outcome';
import { DropdownService } from '../../../../core/services/dropdown/dropdown.service';
import { UniqueEmergencyNumberValidator } from '../../../../core/validators/emergency-number.validator';
import { CaseService } from '../../services/case.service';
import { getCurrentTimeString } from 'src/app/core/helpers/utils';
import { UpdateResponse } from 'src/app/core/models/outstanding-case';

@Component({
  selector: 'emergency-case-outcome',
  templateUrl: './emergency-case-outcome.component.html',
  styleUrls: ['./emergency-case-outcome.component.scss']
})
export class EmergencyCaseOutcomeComponent implements OnInit {

  @Input() recordForm: FormGroup;
  @Output() public result = new EventEmitter<UpdateResponse>();
  @ViewChild("sameAsNumberField",{ read: ElementRef, static:false }) sameAsNumberField: ElementRef;

  callOutcomes$:Observable<CallOutcomeResponse[]>;
  callOutcomes;
  currentOutcomeId:number;

  sameAs:boolean;
  sameAsId:number;

  constructor(
    private dropdowns: DropdownService,
    private caseService: CaseService,
    private fb: FormBuilder,
    private emergencyNumberValidator:UniqueEmergencyNumberValidator,
    private changeDetector:ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    let callOutcome = this.recordForm.get("callOutcome") as FormGroup;

    callOutcome.addControl("sameAsNumber", new FormControl(null, [], [this.emergencyNumberValidator.validate(this.recordForm.get("emergencyDetails.emergencyCaseId").value, 0)]));

    this.callOutcomes$ = this.dropdowns.getCallOutcomes();

    this.callOutcomes$.subscribe(callOutcome => {

      this.sameAsId = callOutcome.find(outcome => outcome.CallOutcome === "Same as").CallOutcomeId;

    });


    this.changeDetector.detectChanges();
  }

  outcomeChanged(){

    let sameAsNumber:AbstractControl = this.recordForm.get("callOutcome.sameAsNumber") as AbstractControl;

    sameAsNumber.setValue(null);
    sameAsNumber.setErrors(null);

    let callOutcome:CallOutcomeResponse = this.recordForm.get('callOutcome').value;

    this.sameAs = this.sameAsId === callOutcome.CallOutcomeId;

    this.changeDetector.detectChanges();

    //Make sure we focus when we're selecting same as
    if(this.sameAs){
      setTimeout(() => this.sameAsNumberField.nativeElement.focus(), 0);
      this.changeDetector.detectChanges();
    }

  }

  async save(){

    //If we haven't touched the form, don't do anything.
    if(this.recordForm.get("callOutcome").pristine || !this.recordForm.get('callOutcome').value){

      let emptyResult:UpdateResponse = {
        success: null,
        socketEndPoint: null
      };



      this.result.emit(emptyResult);
      return;
    }

    let updateTime = getCurrentTimeString();

    (this.recordForm.get('callOutcome') as FormGroup)
          .addControl("updateTime", new FormControl(updateTime));

    let updateRecord:FormGroup = this.fb.group({
      emergencyForm: [this.recordForm.value]
    });

    await this.caseService.updateCaseOutcome(updateRecord.value).then((data:any) =>

      this.result.emit(data)

    );
  }


}
