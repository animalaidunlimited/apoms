import { Component, Input, OnInit } from '@angular/core';
import { Form, FormArray, UntypedFormBuilder, FormControl, FormControlName, FormGroup } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Observable } from 'rxjs';
import { getCurrentTimeString } from 'src/app/core/helpers/utils';
import { DriverAssignment } from 'src/app/core/models/driver-view';
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
  driverViewAssignments!: Observable<DriverAssignment[]>;

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

  patients!:FormArray;
  patientArray!: FormArray;

  constructor(private driverView: DriverViewService,
    private fb: UntypedFormBuilder,
    private dialog: MatDialog) { }

  ngOnInit(): void {


    this.recordForm.addControl(
      'callerDetails', this.fb.array([this.getCallerFormGroup()])
    );

    this.recordForm.addControl(
      'patients',this.fb.array([this.getPatientFormGroup()])
    );

    this.driverViewAssignments = this.driverView.getAssignmentByStatus(this.actionStatus);

    this.callerDetails = this.recordForm.get('callerDetails') as FormArray;
    this.patients = this.recordForm.get('patients') as FormArray;

  }

  toggleButtonSelection(subAction: string , actionStatusName: string , assignment: DriverAssignment) {

    if(this.patients.length > 1) {
      for(let i=1; i<= this.patients.length; i++) {
        this.patients.removeAt(i);
      }
    }

    if(this.callerDetails.length > 1) {
      for(let i=1; i<= this.callerDetails.length; i++) {
        this.callerDetails.removeAt(i);
      }
    }

    for(let i=0;i<assignment.callerDetails.length - 1;i++) {
      this.callerDetails.push(this.getCallerFormGroup());
    }

    for(let i=0;i<assignment.patients.length - 1;i++) {

      this.patients.push(this.getPatientFormGroup());

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

  getPatientFormGroup() {
    return this.fb.group({
      problems: [''],
      patientId: [],
      tagNumber: [''],
      animalType: [''],
      animalTypeId:[''],
      mediaCount: [],
      largeAnimal: [],
      callOutcome: [],
      deleted:0
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
