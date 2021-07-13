import { analyzeAndValidateNgModules } from '@angular/compiler';
import { Component, Input, OnInit } from '@angular/core';
import { Form, FormArray, FormBuilder, FormControl, FormControlName, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DriverAssignments } from 'src/app/core/models/driver-view';
import { DriverActionDialogComponent } from '../../dialogs/driver-action-dialog/driver-action-dialog.component';
import { DriverViewService } from '../../services/driver-view.service';

@Component({
  selector: 'app-driver-view-assignment',
  templateUrl: './driver-view-assignment.component.html',
  styleUrls: ['./driver-view-assignment.component.scss']
})
export class DriverViewAssignmentComponent implements OnInit {

  @Input() actionStatus!: string;
  @Input() showCompleteFlag!: any;
  driverViewAssignments!: Observable<DriverAssignments[]>; 

  recordForm = this.fb.group({
    location: [''],
    isUpdated: [false],
    patientId: [],
    rescueTime: [''],
    actionStatus: [''],
    callDateTime: [''],
    visitEndDate: [''],
    emergencyCode: [''],
    latLngLiteral: {
        lat: [],
        lng: []
    },
    releaseEndDate: [''],
    visitBeginDate: [''],
    ambulanceAction: [''],
    emergencyCaseId: [],
    emergencyCodeId: [],
    emergencyNumber: [],
    releaseBeginDate: [''],
    releaseDetailsId: [],
    releasePickupDate: [''],
    streetTreatCaseId: [],
    releaseRequestDate: [''],
    streetTreatPriority: [''],
    ambulanceArrivalTime: [''],
    patientCallOutcomeId: [],
    streetTreatPriorityId: [],
    releaseComplainerNotes: [''],
    streetTreatMainProblem: [''],
    streetTreatMainProblemId: [],
    admissionTime:[''],
    inTreatmentAreaId:[]
  });

  callerDetails!:FormArray;
  // callerArray!: FormArray;

  patients!:FormArray;
  // patientArray!: FormArray;

  constructor(private driverView: DriverViewService,
    private fb: FormBuilder,
    private dialog: MatDialog) { }

  ngOnInit(): void {

    this.driverViewAssignments = this.driverView.getAssignmentByStatus(this.actionStatus);

    console.log(this.actionStatus);

    console.log(this.driverViewAssignments);

    this.recordForm.addControl(
      'callerDetails', this.fb.array([this.getCallerFormGroup()])
    );

    this.recordForm.addControl(
      'patients',this.fb.array([this.getPatientFormGroup()])
    );

    this.callerDetails = this.recordForm.get('callerDetails') as FormArray;
    this.patients = this.recordForm.get('patients') as FormArray;
      
  }

  togglebuttonSelection(subAction: string , actionStatusName: string , assignment: DriverAssignments) {

    console.log(assignment);

    for(var i=0;i<assignment.callerDetails.length - 1;i++) {
      this.callerDetails.push(this.getCallerFormGroup());
    }

    for(var i=0;i<assignment.patients.length - 1;i++) {
      this.patients.push(this.getPatientFormGroup())
    }

    this.recordForm.patchValue(assignment);
    
    this.openDriverActionDialog(this.driverView.getDriverViewQuestionFormGroupByActionTypeAndSubAction(actionStatusName, subAction) ,this.recordForm);

  }

  openDriverActionDialog(formBuilderArrayVal: any,assignmentFormGroup: FormGroup) {

    const dialogRef = this.dialog.open(DriverActionDialogComponent, {
      minWidth: '100vw',
      data: {
        formBuilderArray: formBuilderArrayVal,
        formGroup: assignmentFormGroup
      }
    });
  }

  getPatientFormGroup() {
    return this.fb.group({
      problems: [''],
      patientId: [],
      tagNumber: [''],
      animalType: [''],
      mediaCount: [],
      largeAnimal: [],
      PatientCallOutcomeId: []
    });
  }

  getCallerFormGroup() {
    return this.fb.group( {
      callerId: [],
      callerName: [''],
      callerNumber: [''],
      callerAlternativeNumber:['']
    });
  }

}
