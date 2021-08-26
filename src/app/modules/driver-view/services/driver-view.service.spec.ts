import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { DriverViewService } from './driver-view.service';
import { MaterialModule } from './../../../material-module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DriverAssignment } from 'src/app/core/models/driver-view';
import { NgZone } from '@angular/core';
describe('DriverViewService', () => {
  let service: DriverViewService;
  let testData: DriverAssignment;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MaterialModule,
        NgZone
      ],
      providers: [DriverViewService]
    });
    service = TestBed.inject(DriverViewService);

    testData = {
      visitId: null,
      location: 'Udaipur, Rajasthan, India',
      rescuerList:[195],
      visitDay:0,
      patients: [
          {
              position: 1,
              createdDate:'',
              duplicateTag:false,
              patientStatusId: 0,
              patientStatusDate: '',
              isAdmission: false,
              updated: true,
              deleted:false,
              treatmentPriority:0,
              problems: [
                  {
                      problem: 'Abdominal Swelling',
                      problemId: 45
                  }
              ],
              patientId: 656181,
              tagNumber: '',
              animalType: 'Calf',
              callOutcome: {
                  CallOutcome: {
                      CallOutcome: null,
                      CallOutcomeId: null,
                      SortOrder: null
                  },
                  sameAsNumber: null
              },
              largeAnimal: 1,
              animalTypeId: 2,
              admissionArea: null,
              problemsString: 'Abdominal Swelling',
              admissionAccepted: null
          }
      ],
      isUpdated: false,
      patientId: 656181,
      visitDate: null,
      dispatcher: 195,
      rescueTime: null,
      visitTypeId: null,
      actionStatus: null,
      callDateTime: '2021-08-23T10:50:00',
      caseComments: 'nnn',
      visitEndDate: null,
      admissionTime: null,
      callerDetails: [
          {
            callerId: 177,
            callerName: 'Arpit',
            callerNumber: '8769184667',
            callerAlternativeNumber: ''
          }
      ],
      emergencyCode: 'Yellow',
      latLngLiteral: {
          lat: 24.5851328,
          lng: 73.70973242
      },
      visitStatusId: null,
      releaseEndDate: null,
      visitBeginDate: null,
      ambulanceAction: '',
      emergencyCaseId: 737107,
      emergencyCodeId: 3,
      emergencyNumber: 3,
      visitAdminNotes: null,
      releaseBeginDate: null,
      releaseDetailsId: null,
      inTreatmentAreaId: 0,
      releasePickupDate: null,
      rescueAmbulanceId: 1,
      streetTreatCaseId: null,
      releaseAmbulanceId: null,
      releaseRequestDate: null,
      visitOperatorNotes: null,
      streetTreatPriority: null,
      ambulanceArrivalTime: null,
      patientCallOutcomeId: null,
      streetTreatPriorityId: null,
      releaseComplainerNotes: null,
      streetTreatAmbulanceId: null,
      streetTreatMainProblem: null,
      streetTreatMainProblemId: null,
      rescueAmbulanceAssignmentDate: '2021-08-23T10:50:00',
      releaseAmbulanceAssignmentDate: null,
      streetTreatAmbulanceAssignmentDate: null,
      trueStatus:''
  };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  it('Should give the assignment status as Assigned for rescue with ambulance assignment time only.', ()=> {
    testData.trueStatus = 'Assigned';
    testData.ambulanceAction = 'Rescue';
    const data = service.getAssignmentStatus(testData);
    const trueStatusVal = testData.trueStatus;
    expect(data.actionStatus).toEqual(trueStatusVal);
  });

  it('Should give the assignment status as Assigned for rescue with ambulance assignment time only.', ()=> {
    testData.ambulanceArrivalTime = '2021-08-24 10:10:55';
    testData.trueStatus = 'In Progress';
    testData.ambulanceAction = 'Rescue';
    const data = service.getAssignmentStatus(testData);
    const trueStatusVal = testData.trueStatus;
    expect(data.actionStatus).toEqual(trueStatusVal);
  });

  it('Should give the assignment status as Assigned for rescue with ambulance assignment time only.', ()=> {
    testData.ambulanceArrivalTime = '2021-08-24 10:10:55';
    testData.rescueTime = '2021-08-24 11:10:55';
    testData.trueStatus = 'In Ambulance';
    testData.ambulanceAction = 'Rescue';
    const data = service.getAssignmentStatus(testData);
    const trueStatusVal = testData.trueStatus;
    expect(data.actionStatus).toEqual(trueStatusVal);
  });

  it('Should give the assignment status as Assigned for rescue with ambulance assignment time only.', ()=> {
    testData.ambulanceArrivalTime = '2021-08-24 10:10:55';
    testData.rescueTime = '2021-08-24 11:10:55';
    testData.rescueTime = '2021-08-24 11:30:55';
    testData.trueStatus = 'Complete';
    testData.ambulanceAction = 'Rescue';
    const data = service.getAssignmentStatus(testData);
    const trueStatusVal = testData.trueStatus;
    expect(data.actionStatus).toEqual(trueStatusVal);
  });

});
