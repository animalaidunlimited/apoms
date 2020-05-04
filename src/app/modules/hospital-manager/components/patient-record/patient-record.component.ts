import { Component, OnInit, Input} from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { SearchRecordTab } from 'src/app/core/models/search-record-tab';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'patient-record',
  templateUrl: './patient-record.component.html',
  styleUrls: ['./patient-record.component.scss']
})
export class PatientRecordComponent implements OnInit {

  recordForm:FormGroup;

  @Input() incomingPatient:SearchRecordTab;

  patientCallPatientId:number;

  patientLoaded:boolean = true;

  hideMenu:boolean;


  constructor(private fb: FormBuilder) {}

  ngOnInit() {

    this.hideMenu = window.innerWidth > 840 ? false : true;

    this.recordForm = this.fb.group({

      emergencyDetails: this.fb.group({
        emergencyCaseId: [this.incomingPatient.emergencyCaseId],
        emergencyNumber: [this.incomingPatient.emergencyNumber],
        callDateTime: [this.incomingPatient.callDateTime]
      }),

      patientDetails: this.fb.group({
        patientId: [this.incomingPatient.patientId],
        tagNumber: [this.incomingPatient.tagNumber, Validators.required],
        currentLocation: [this.incomingPatient.currentLocation],

      }),
      patientStatus: this.fb.group({
        status: [''],
        releaseDate: [''],
        diedDate: [''],
        escapeDate: [''],
        PN: [''],
        suspectedRabies: ['']
      }),
      callerDetails: this.fb.group({
        callerId: [''],
        callerName: [''],
        callerNumber: [''],
        callerAlternativeNumber: ['']
      }),
      callOutcome: this.fb.group({
        callOutcome: [this.incomingPatient.callOutcome]
      })
    });

    //Use this to disable tabs before we've got a patient.
    this.patientLoaded = !(this.incomingPatient?.patientId > 0);

  }

  tabChanged(event:MatTabChangeEvent){

    //Only populate the ids when we want to load the data
    if(event.tab.textLabel === "Patient Calls"){
      this.patientCallPatientId = this.recordForm.get("patientDetails.patientId").value;
    }


  }

  toggleMenu(){

    this.hideMenu = !this.hideMenu;

  }




  saveForm()
  {
    alert("Save the form!");
  }

}
