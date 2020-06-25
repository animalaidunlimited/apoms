import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { CallOutcomeResponse } from '../../../../core/models/call-outcome';
import { DropdownService } from '../../../../core/services/dropdown/dropdown.service';
import { UniqueEmergencyNumberValidator } from '../../../../core/validators/emergency-number.validator';
import { CaseService } from '../../services/case.service';
import { getCurrentTimeString } from 'src/app/core/utils';
import { UpdateResponse } from 'src/app/core/models/outstanding-case';

@Component({
  selector: 'emergency-case-outcome',
  templateUrl: './emergency-case-outcome.component.html',
  styleUrls: ['./emergency-case-outcome.component.scss']
})
export class EmergencyCaseOutcomeComponent implements OnInit {

  @Input() recordForm: FormGroup;
  @Output() public result = new EventEmitter<UpdateResponse>();

  callOutcomes$:Observable<CallOutcomeResponse[]>;
  callOutcomes;
  currentOutcomeId:number;

  sameAs:boolean;
  sameAsId:number;

  constructor(
    private dropdowns: DropdownService,
    private caseService: CaseService,
    private fb: FormBuilder,
    private emergencyNumberValidator:UniqueEmergencyNumberValidator
  ) { }

  ngOnInit(): void {

    this.recordForm.addControl(
      "callOutcome", new FormGroup( {callOutcome : new FormControl()}));

    let callOutcome = this.recordForm.get("callOutcome") as FormGroup;

    callOutcome.addControl("sameAsNumber", new FormControl(null, [], [this.emergencyNumberValidator.validate(this.recordForm.get("emergencyDetails.emergencyCaseId").value, 0)]));

    this.callOutcomes$ = this.dropdowns.getCallOutcomes();

    this.callOutcomes$.subscribe(callOutcome => {

      this.sameAsId = callOutcome.find(outcome => outcome.CallOutcome === "Same as").CallOutcomeId;

    });
  }

  outcomeChanged(){

    this.recordForm.get("callOutcome.sameAsNumber").setValue(null);

    this.sameAs = this.sameAsId === this.recordForm.get('callOutcome.callOutcome').value;

  }

  async save(){

    //If we haven't touched the form, don't do anything.
    if(this.recordForm.pristine || !this.recordForm.get('callOutcome').value){

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
      emeregncyForm: [this.recordForm.value]
    });

    await this.caseService.updateCaseOutcome(updateRecord.value).then((data:any) =>

      this.result.emit(data)

    );
  }


}
