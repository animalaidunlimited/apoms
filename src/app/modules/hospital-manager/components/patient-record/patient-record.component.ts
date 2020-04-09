import { Component, OnInit, Input} from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { SearchRecordTab } from 'src/app/core/models/search-record-tab';

@Component({
  selector: 'patient-record',
  templateUrl: './patient-record.component.html',
  styleUrls: ['./patient-record.component.scss']
})
export class PatientRecordComponent implements OnInit {

  recordForm:FormGroup;

  @Input() incomingPatient:SearchRecordTab;


  constructor(private fb: FormBuilder) {}

  ngOnInit() {

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


  }

  saveForm()
  {
    alert("Save the form!");
  }

}
