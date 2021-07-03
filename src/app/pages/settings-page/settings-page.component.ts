import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { EmergencyCase } from 'src/app/core/models/emergency-record';
import { Priority } from 'src/app/core/models/priority';
import { TreatmentArea } from 'src/app/core/models/treatment-lists';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { UniqueTagNumberValidator } from 'src/app/core/validators/tag-number.validator';
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

    addOnBlur = true;

    dummyArray!: FormArray;
    dummyRecords!:FormGroup;
    dummyRecordTags: DummyRecordTag[] = [];


    emergencyRecord: any;

    errorMatcher = new CrossFieldErrorMatcher();

    releaseVersion! : string;
    removable = true;

    selectable = true;
    visible = true;

    treatmentPriorities!:Observable<Priority[]>;
    treatmentAreas!:Observable<TreatmentArea[]>;

    saveSuccess = false;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA];


    constructor(private caseService: CaseService,
        private dropdown: DropdownService,
        private fb: FormBuilder,
        private uniqueTagNumberValidator: UniqueTagNumberValidator
        ) {}


    ngOnInit() {

        this.treatmentPriorities = this.dropdown.getPriority();
        this.treatmentAreas = this.dropdown.getTreatmentAreas();

        this.dummyRecords = this.fb.group({
            dummyArray: this.fb.array([])
        });

        this.dummyArray = this.dummyRecords.get('dummyArray') as FormArray;

        this.dummyArray.push(this.getEmptyRecord());

        this.releaseVersion = '1.0.20.1';
    }

    refreshApp(){
        window.location.reload();
    }

    getEmptyRecord(){

        // Use an AbstractControl here because the async validator relies on having one.
        const patientIdControl = this.fb.control({value:null});

        return this.fb.group({
            tagNumber: ['', Validators.required,this.uniqueTagNumberValidator.validate(
                0,
                patientIdControl.value)],
            admissionArea: [, Validators.required],
            treatmentPriority: ['', Validators.required],
            saved: false
        });
    }




    add(dummyRecord: AbstractControl){

        const tagNumber = dummyRecord.get('tagNumber')?.value;
        const treatmentPriorityId = dummyRecord.get('treatmentPriority')?.value;
        const admissionArea = dummyRecord.get('admissionArea')?.value;

        const dummyEmergencyRecord:EmergencyCase = this.getEmptyEmergencyCaseRecord(tagNumber, treatmentPriorityId, admissionArea);


            this.caseService
            .insertCase(dummyEmergencyRecord)
            .then(data => {

                if(data.emergencyCaseSuccess === 1 && data.patients[0].success === 1) {
                    dummyRecord.get('saved')?.setValue(true);
                    this.dummyArray.push(this.getEmptyRecord());
                }
            });



    }

    getEmptyEmergencyCaseRecord(tagNumber:string, treatmentPriority: number, admissionArea: number) : any{

        const guid = this.caseService.generateUUID();

        return {

            emergencyForm: {
                emergencyDetails: {
                    callDateTime: '2021-03-19T10:01',
                    code: {
                        EmergencyCode: 'Green',
                        EmergencyCodeId: 2
                    },
                    dispatcher: 7,
                    emergencyCaseId: 0,
                    emergencyNumber: -1,
                    guId: guid,
                    updateTime: '2021-03-19T10:01'
                },
                patients: [{
                    animalType: 'Dog',
                    animalTypeId: 5,
                    deleted: false,
                    duplicateTag: false,
                    patientId: 0,
                    position: 1,
                    problems: [
                        {problemId: 42, problem: 'Wound'}
                    ],
                    problemsString: 'Wound',
                    tagNumber: tagNumber.trim().toUpperCase(),
                    isAdmission: false,
                    admissionArea,
                    admissionAccepted: false,
                    treatmentPriority,
                    updated: true,
                    sameAsNumber: null,
                    callOutcome:{
                        CallOutcome: {CallOutcomeId: 1, CallOutcome: 'Admission'},
                        sameAsNumber: null
                    }
                }],
                rescueDetails: {
                    admissionTime: '2021-03-19T10:03',
                    ambulanceArrivalTime: '2021-03-19T10:03',
                    rescueTime: '2021-03-19T10:03',
                    rescuer1Id: 7,
                    rescuer2Id: 9
                },
                locationDetails:{
                    latitude: 24.6159764,
                    location: 'Badi Lake Rd, Bari, Rajasthan 313011, India',
                    longitude: 73.64295849999999
                },

                callerDetails: {
                    callerArray:[
                        {callerId: undefined, callerName: 'Dummy Caller', callerNumber: '7894561237', callerAlternativeNumber: '', primaryCaller: true}]
                }
            }


        };

    }
}
