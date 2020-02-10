import { Component, OnInit} from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'patient-record',
  templateUrl: './patient-record.component.html',
  styleUrls: ['./patient-record.component.scss']
})
export class PatientRecordComponent implements OnInit {

  recordForm;


  constructor(private fb: FormBuilder) {}

  ngOnInit() {


    this.recordForm = this.fb.group({

      patientDetails: this.fb.group({
        emergencyNumber: ['45675', Validators.required],
        admissionTime: [, Validators.required],
        species: ['', Validators.required],
        mainProblems: ['', Validators.required],
        tagNumber: ['', Validators.required],
        description: ['', Validators.required],
        sex: ['']
        
      }),
      patientStatus: this.fb.group({
        status: [''],
        releaseDate: [''],
        diedDate: [''],
        escapeDate: [''],
        PN: [''],
        suspectedRabies: [''],
        currentArea: [''],
      }),
      complainerDetails: this.fb.group({ 
        complainerName: [''],
        complainerNumber: [''],
        complainerAlternateNumber: ['']
      }),
      locationDetails: this.fb.group({
        animalArea: [''],
        animalLocation: ['']
      })
    }
    );    

  }

}
