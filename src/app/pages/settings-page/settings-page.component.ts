import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import {MatChipInputEvent} from '@angular/material/chips';
import { BehaviorSubject } from 'rxjs';
import { PatientService } from 'src/app/core/services/patient/patient.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { CaseService } from 'src/app/modules/emergency-register/services/case.service';

export interface DummyRecordTag {
    tagNumber: string;
  }

@Component({
    selector: 'app-settings-page',
    templateUrl: './settings-page.component.html',
    styleUrls: ['./settings-page.component.scss'],
})
export class SettingsPageComponent implements OnInit {
    releaseVersion! : string;

    visible = true;
    selectable = true;
    removable = true;
    addOnBlur = true;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    dummyRecordTags: DummyRecordTag[] = [];

    saveSuccess = false;

    emergencyRecord: any;

    constructor(private caseService: CaseService,
        private patientService: PatientService,
        private snackBar: SnackbarService) {}


    ngOnInit() {
        this.emergencyRecord = {
            
            emergencyForm: {
                emergencyDetails: {
                    callDateTime: "2021-03-19T10:01",
                    code: {
                        EmergencyCode: "Green",
                        EmergencyCodeId: 2
                    },
                    dispatcher: 195,
                    emergencyCaseId: 0,  
                    emergencyNumber: -1,
                    guId: '',
                    updateTime: '2021-03-19T11:30'
                },
                patients: [{
                    animalType: "Dog",
                    animalTypeId: 5,
                    deleted: false,
                    duplicateTag: "VALID",
                    patientId: 0,
                    position: 1,
                    problems: [
                        {problemId: 42, problem: "Wound"}
                    ],
                    problemsString: "Wound",
                    tagNumber: '',
                    updated: true
                }],
                rescueDetails: {
                    admissionTime: "2021-03-19T10:03",
                    ambulanceArrivalTime: "2021-03-19T10:03",
                    rescueTime: "2021-03-19T10:03",
                    rescuer1Id: 197,
                    rescuer2Id: 215
                },
                locationDetails:{
                    latitude: 24.6159764,
                    location: "Badi Lake Rd, Bari, Rajasthan 313011, India",
                    longitude: 73.64295849999999
                },
        
                callerDetails: {
                    callerArray:[
                        {callerId: undefined, callerName: "Dummy Caller", callerNumber: "7894561237", callerAlternativeNumber: "", primaryCaller: true}]
                },
        
                callOutcome:{
                    CallOutcome: {CallOutcomeId: 1, CallOutcome: "Admission"},
                    sameAsNumber: null
                }
            }
    
    
        }

        this.releaseVersion = '1.0.17';
    }

    refreshApp(){
        window.location.reload();
    }

    add(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;

        const tagNumber = value.trim().toUpperCase().toString();
        let guid = this.caseService.generateUUID();

        let tagExistBoolean = this.patientService.checkTagNumberExists(tagNumber,0,0);

        tagExistBoolean.subscribe(val=> {
            if(val.success === 0) {
                this.emergencyRecord.emergencyForm.patients[0].tagNumber = tagNumber;
                this.emergencyRecord.emergencyForm.emergencyDetails.guId = guid;
        
                if(this.emergencyRecord.emergencyForm.patients[0].tagNumber !== '') {
                    this.caseService
                    .insertCase(this.emergencyRecord)
                    .then(data => {

                        if(data.emergencyCaseSuccess === 1 && data.patients[0].success === 1) {
                            this.saveSuccess = true;
                        }
                    });

                    if ((value || '').trim()) {
                        this.dummyRecordTags.push({tagNumber: tagNumber});
                    }
                }
            
                // Add our fruit
                
            }

            else {
                this.snackBar.errorSnackBar('Tag already exists.','OK');
            }
        })
        
        
    
        // Reset the input value
        if (input) {
          input.value = '';
        }
      }
    
      remove(tag: DummyRecordTag): void {
        const index = this.dummyRecordTags.indexOf(tag);
    
        if (index >= 0) {
          this.dummyRecordTags.splice(index, 1);
        }
      }
}
