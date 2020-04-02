import { Component, OnInit, Input} from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'patient-record',
  templateUrl: './patient-record.component.html',
  styleUrls: ['./patient-record.component.scss']
})
export class PatientRecordComponent implements OnInit {

  recordForm;

  @Input() emergencyCaseId:number;
  @Input() patientId:number;
  @Input() tagNumber:string;
  @Input() currentLocation:string;


  constructor(private fb: FormBuilder) {}

  ngOnInit() {

    this.recordForm = this.fb.group({

      emergencyDetails: this.fb.group({
        emergencyCaseId: [this.emergencyCaseId],
      }),

      patientDetails: this.fb.group({
        patientId: [this.patientId],
        emergencyNumber: [, Validators.required],
        admissionTime: [, Validators.required],
        animalType: ['', Validators.required],
        mainProblems: ['', Validators.required],
        tagNumber: [this.tagNumber, Validators.required],
        description: ['', Validators.required],
        currentLocation: [this.currentLocation],
        sex: ['']

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
      })
    }
    );

  }

  saveForm()
  {
    alert("Save the form!");
  }

}
