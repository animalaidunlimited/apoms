import { analyzeAndValidateNgModules } from '@angular/compiler';
import { Component, Input, OnInit } from '@angular/core';
import { Form, FormArray, FormBuilder, FormControl, FormControlName, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { getCurrentTimeString } from 'src/app/core/helpers/utils';
import { DriverAssignments } from 'src/app/core/models/driver-view';
import { Patient } from 'src/app/core/models/patients';
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
    inTreatmentAreaId:[],
    dispatcher:[],
    updateTime:[getCurrentTimeString()],
    caseComments:[''],
    rescueAmbulanceId: [],
    rescueAmbulanceAssignmentDate: [''],
    releaseAmbulanceId: [],
    releaseAmbulanceAssignmentDate: [''],
    visitId: [],
    visitTypeId: [],
    visitDate: [],
    visitStatusId: [],
    visitAdminNotes: [''],
    visitOperatorNotes: [''],
    visitDay:[],
    streetTreatAmbulanceId: [],
    streetTreatAmbulanceAssignmentDate: [''],
  });

  callerDetails!:FormArray;
  // callerArray!: FormArray;

  // patients!:FormArray;
  // patientArray!: FormArray;

  constructor(private driverView: DriverViewService,
    private fb: FormBuilder,
    private dialog: MatDialog) { }

  ngOnInit(): void {

    
    this.recordForm.addControl(
      'callerDetails', this.fb.array([this.getCallerFormGroup()])
    );

    // this.recordForm.addControl(
    //   'patients',this.fb.array([this.getPatientFormGroup()])
    // );

    this.driverViewAssignments = this.driverView.getAssignmentByStatus(this.actionStatus);

    this.callerDetails = this.recordForm.get('callerDetails') as FormArray;
    // this.patients = this.recordForm.get('patients') as FormArray;
      
  }

  togglebuttonSelection(subAction: string , actionStatusName: string , assignment: DriverAssignments) {


    for(let i=0;i<assignment.callerDetails.length - 1;i++) {
      this.callerDetails.push(this.getCallerFormGroup());
    }
    this.recordForm.patchValue(assignment);
    
    this.openDriverActionDialog(this.driverView.getDriverViewQuestionFormGroupByActionTypeAndSubAction(actionStatusName, subAction) ,
    this.recordForm, assignment.patients, subAction);

  }

  openDriverActionDialog(formBuilderArrayVal: any,assignmentFormGroup: FormGroup, patientsArray: Patient[] , subAction: string) {

    const dialogRef = this.dialog.open(DriverActionDialogComponent, {
      disableClose: true,
      minWidth: '100vw',
      data: {
        formBuilderArray: formBuilderArrayVal,
        formGroup: assignmentFormGroup,
        patientsArray,
        subAction
      }
    });
  }

  // getPatientFormGroup() {
  //   return this.fb.group({
  //     problems: [''],
  //     patientId: [],
  //     tagNumber: [''],
  //     animalType: [''],
  //     mediaCount: [],
  //     largeAnimal: [],
  //     PatientCallOutcomeId: []
  //   });
  // }

  getCallerFormGroup() {
    return this.fb.group( {
      callerId: [],
      callerName: [''],
      callerNumber: [''],
      callerAlternativeNumber:['']
    });
  }

}