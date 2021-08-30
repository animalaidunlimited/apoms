import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { DriverViewService } from './driver-view.service';
import { MaterialModule } from './../../../material-module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DriverAssignment } from 'src/app/core/models/driver-view';
describe('DriverViewService', () => {
  let service: DriverViewService;
  let testData: DriverAssignment;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MaterialModule
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

// Tests for rescue
  it('Should give the assignment status as Assigned for rescue with ambulance assignment time only.', ()=> {
    testData.trueStatus = 'Assigned';
    testData.ambulanceAction = 'Rescue';
    const data = service.getAssignmentStatus(testData);
    const trueStatusVal = testData.trueStatus;
    expect(data.actionStatus).toEqual(trueStatusVal);
  });

  it('Should give the assignment status as In progress for rescue with ambulance arrival time.', ()=> {
    testData.ambulanceArrivalTime = '2021-08-24 10:10:55';
    testData.trueStatus = 'In Progress';
    testData.ambulanceAction = 'Rescue';
    const data = service.getAssignmentStatus(testData);
    const trueStatusVal = testData.trueStatus;
    expect(data.actionStatus).toEqual(trueStatusVal);
  });

  it('Should give the assignment status as In Ambulance for rescue with rescue time.', ()=> {
    testData.ambulanceArrivalTime = '2021-08-24 10:10:55';
    testData.rescueTime = '2021-08-24 11:10:55';
    testData.trueStatus = 'In Ambulance';
    testData.ambulanceAction = 'Rescue';
    const data = service.getAssignmentStatus(testData);
    const trueStatusVal = testData.trueStatus;
    expect(data.actionStatus).toEqual(trueStatusVal);
  });

  it('Should give the assignment status as Complete for rescue with admission time.', ()=> {
    testData.ambulanceArrivalTime = '2021-08-24 10:10:55';
    testData.rescueTime = '2021-08-24 11:10:55';
    testData.admissionTime = '2021-08-24 11:30:55';
    testData.trueStatus = 'Complete';
    testData.ambulanceAction = 'Rescue';
    const data = service.getAssignmentStatus(testData);
    const trueStatusVal = testData.trueStatus;
    expect(data.actionStatus).toEqual(trueStatusVal);
  });

  
// Tests for release

  it('Should give assignment status as Assigned for release with assigned ambulance id and time.', ()=> {
    testData.ambulanceArrivalTime = '2021-08-24 10:10:55';
    testData.rescueTime = '2021-08-24 11:10:55';
    testData.admissionTime = '2021-08-24 11:30:55';
    testData.releaseDetailsId = 1;
    testData.patients[0].callOutcome.CallOutcome.CallOutcome = 'Admission';
    testData.patients[0].callOutcome.CallOutcome.CallOutcomeId = 1;
    testData.patients[0].tagNumber = 'C1';
    testData.trueStatus = 'Assigned';
    testData.ambulanceAction = 'Release';
    const data = service.getAssignmentStatus(testData);
    const trueStatusVal = testData.trueStatus;
    expect(data.actionStatus).toEqual(trueStatusVal);

  });

  it('Should give assignment status as Assigned for release with pickup time.', ()=> {
    testData.ambulanceArrivalTime = '2021-08-24 10:10:55';
    testData.rescueTime = '2021-08-24 11:10:55';
    testData.admissionTime = '2021-08-24 11:30:55';
    testData.releasePickupDate = '2021-08-25 11:30:55';
    testData.releaseDetailsId = 1;
    testData.patients[0].callOutcome.CallOutcome.CallOutcome = 'Admission';
    testData.patients[0].callOutcome.CallOutcome.CallOutcomeId = 1;
    testData.patients[0].tagNumber = 'C1';
    testData.trueStatus = 'In Ambulance';
    testData.ambulanceAction = 'Release';
    const data = service.getAssignmentStatus(testData);
    const trueStatusVal = testData.trueStatus;
    expect(data.actionStatus).toEqual(trueStatusVal);

  });

  it('Should give assignment status as Assigned for release with begin time.', ()=> {
    testData.ambulanceArrivalTime = '2021-08-24 10:10:55';
    testData.rescueTime = '2021-08-24 11:10:55';
    testData.admissionTime = '2021-08-24 11:30:55';
    testData.releaseDetailsId = 1;
    testData.releasePickupDate = '2021-08-25 11:30:55';
    testData.releaseBeginDate = '2021-08-25 11:35:55';
    testData.patients[0].callOutcome.CallOutcome.CallOutcome = 'Admission';
    testData.patients[0].callOutcome.CallOutcome.CallOutcomeId = 1;
    testData.patients[0].tagNumber = 'C1';
    testData.trueStatus = 'In Progress';
    testData.ambulanceAction = 'Release';
    const data = service.getAssignmentStatus(testData);
    const trueStatusVal = testData.trueStatus;
    expect(data.actionStatus).toEqual(trueStatusVal);

  });

  it('Should give assignment status as Assigned for release with end time.', ()=> {
    testData.ambulanceArrivalTime = '2021-08-24 10:10:55';
    testData.rescueTime = '2021-08-24 11:10:55';
    testData.admissionTime = '2021-08-24 11:30:55';
    testData.releasePickupDate = '2021-08-25 11:30:55';
    testData.releaseBeginDate = '2021-08-25 11:35:55';
    testData.releaseEndDate = '2021-08-25 11:40:55';
    testData.releaseDetailsId = 1;
    testData.patients[0].callOutcome.CallOutcome.CallOutcome = 'Admission';
    testData.patients[0].callOutcome.CallOutcome.CallOutcomeId = 1;
    testData.patients[0].tagNumber = 'C1';
    testData.trueStatus = 'Complete';
    testData.ambulanceAction = 'Release';
    const data = service.getAssignmentStatus(testData);
    const trueStatusVal = testData.trueStatus;
    expect(data.actionStatus).toEqual(trueStatusVal);

  });

  
// Tests for ST
  it('Should give assigned for ST.', ()=> {
    
    testData.patients[0].callOutcome.CallOutcome.CallOutcomeId = 18;
    testData.patients[0].tagNumber = 'ST1';
    testData.streetTreatCaseId = 22;
    testData.visitDate = '2021-08-25 11:40:55';
    testData.trueStatus = 'Assigned';
    testData.ambulanceAction = 'StreetTreat';
    const data = service.getAssignmentStatus(testData);
    const trueStatusVal = testData.trueStatus;
    expect(data.actionStatus).toEqual(trueStatusVal);

  });

  it('Should give In progress for ST.', ()=> {
    
    testData.patients[0].callOutcome.CallOutcome.CallOutcomeId = 18;
    testData.patients[0].tagNumber = 'ST1';
    testData.visitId = 18;
    testData.visitDate = '2021-08-25 11:40:55';
    testData.streetTreatCaseId = 22;
    testData.visitBeginDate = '2021-08-25 11:40:55';
    testData.trueStatus = 'In Progress';
    testData.ambulanceAction = 'StreetTreat';
    const data = service.getAssignmentStatus(testData);
    const trueStatusVal = testData.trueStatus;
    expect(data.actionStatus).toEqual(trueStatusVal);

  });

  it('Should give complete for ST.', ()=> {
    
    testData.patients[0].callOutcome.CallOutcome.CallOutcomeId = 18;
    testData.patients[0].tagNumber = 'ST1';
    testData.streetTreatCaseId = 22;
    testData.visitDate = '2021-08-25 11:40:55';
    testData.visitBeginDate = '2021-08-25 11:40:55';
    testData.visitEndDate = '2021-08-25 11:40:55';
    testData.trueStatus = 'Complete';
    testData.ambulanceAction = 'StreetTreat';
    const data = service.getAssignmentStatus(testData);
    const trueStatusVal = testData.trueStatus;
    expect(data.actionStatus).toEqual(trueStatusVal);

  });

  // Tests for STRelease

  it('Should give the assignment status as Assigned for STRelease.', ()=> {
    testData.ambulanceArrivalTime = '2021-08-24 10:10:55';
    testData.rescueTime = '2021-08-24 11:10:55';
    testData.admissionTime = '2021-08-24 11:30:55';
    testData.patients[0].callOutcome.CallOutcome.CallOutcome = 'Admission';
    testData.patients[0].callOutcome.CallOutcome.CallOutcomeId = 1;
    testData.patients[0].tagNumber = 'C1';
    testData.releaseDetailsId = 1;
    testData.streetTreatCaseId = 2;
    testData.trueStatus = 'Assigned';
    testData.ambulanceAction = 'STRelease';
    const data = service.getAssignmentStatus(testData);
    const trueStatusVal = testData.trueStatus;
    expect(data.actionStatus).toEqual(trueStatusVal);
  });

  it('Should give the assignment status as in an=mbulance for STRelease.', ()=> {
    testData.ambulanceArrivalTime = '2021-08-24 10:10:55';
    testData.rescueTime = '2021-08-24 11:10:55';
    testData.admissionTime = '2021-08-24 11:30:55';
    testData.releasePickupDate = '2021-08-25 11:30:55';
    // testData.releaseBeginDate = '2021-08-25 11:35:55';
    // testData.releaseEndDate = '2021-08-25 11:40:55';
    testData.patients[0].callOutcome.CallOutcome.CallOutcome = 'Admission';
    testData.patients[0].callOutcome.CallOutcome.CallOutcomeId = 1;
    testData.patients[0].tagNumber = 'C1';
    testData.releaseDetailsId = 1;
    testData.streetTreatCaseId = 2;
    testData.trueStatus = 'In Ambulance';
    testData.ambulanceAction = 'STRelease';
    const data = service.getAssignmentStatus(testData);
    const trueStatusVal = testData.trueStatus;
    expect(data.actionStatus).toEqual(trueStatusVal);
  });

  it('Should give the assignment status as in progress for STRelease.', ()=> {
    testData.ambulanceArrivalTime = '2021-08-24 10:10:55';
    testData.rescueTime = '2021-08-24 11:10:55';
    testData.admissionTime = '2021-08-24 11:30:55';
    testData.releasePickupDate = '2021-08-25 11:30:55';
    testData.releaseBeginDate = '2021-08-25 11:35:55';
    // testData.releaseEndDate = '2021-08-25 11:40:55';
    testData.patients[0].callOutcome.CallOutcome.CallOutcome = 'Admission';
    testData.patients[0].callOutcome.CallOutcome.CallOutcomeId = 1;
    testData.patients[0].tagNumber = 'C1';
    testData.releaseDetailsId = 1;
    testData.streetTreatCaseId = 2;
    testData.trueStatus = 'In Progress';
    testData.ambulanceAction = 'STRelease';
    const data = service.getAssignmentStatus(testData);
    const trueStatusVal = testData.trueStatus;
    expect(data.actionStatus).toEqual(trueStatusVal);
  });

  it('Should give the assignment status as in progress for STRelease.', ()=> {
    testData.ambulanceArrivalTime = '2021-08-24 10:10:55';
    testData.rescueTime = '2021-08-24 11:10:55';
    testData.admissionTime = '2021-08-24 11:30:55';
    testData.releasePickupDate = '2021-08-25 11:30:55';
    testData.releaseBeginDate = '2021-08-25 11:35:55';
    testData.releaseEndDate = '2021-08-25 11:40:55';
    testData.visitId = 1;
    testData.patients[0].callOutcome.CallOutcome.CallOutcome = 'Admission';
    testData.patients[0].callOutcome.CallOutcome.CallOutcomeId = 1;
    testData.patients[0].tagNumber = 'C1';
    testData.releaseDetailsId = 1;
    testData.streetTreatCaseId = 2;
    testData.trueStatus = 'In Progress';
    testData.ambulanceAction = 'STRelease';
    const data = service.getAssignmentStatus(testData);
    const trueStatusVal = testData.trueStatus;
    expect(data.actionStatus).toEqual(trueStatusVal);
  });

  it('Should give the assignment status as in progress for STRelease.', ()=> {
    testData.ambulanceArrivalTime = '2021-08-24 10:10:55';
    testData.rescueTime = '2021-08-24 11:10:55';
    testData.admissionTime = '2021-08-24 11:30:55';
    testData.releasePickupDate = '2021-08-25 11:30:55';
    testData.releaseBeginDate = '2021-08-25 11:35:55';
    testData.releaseEndDate = '2021-08-25 11:40:55';
    testData.visitId = 1;
    testData.visitBeginDate = '2021-08-25 11:40:55';
    testData.visitEndDate = '2021-08-25 11:40:55';
    testData.patients[0].callOutcome.CallOutcome.CallOutcome = 'Admission';
    testData.patients[0].callOutcome.CallOutcome.CallOutcomeId = 1;
    testData.patients[0].tagNumber = 'C1';
    testData.releaseDetailsId = 1;
    testData.streetTreatCaseId = 2;
    testData.trueStatus = 'Complete';
    testData.ambulanceAction = 'STRelease';
    const data = service.getAssignmentStatus(testData);
    const trueStatusVal = testData.trueStatus;
    expect(data.actionStatus).toEqual(trueStatusVal);
  });

  it('Should not give the assignment status as in progress for STRelease.', ()=> {
    testData.ambulanceArrivalTime = '2021-08-24 10:10:55';
    testData.rescueTime = '2021-08-24 11:10:55';
    testData.admissionTime = '2021-08-24 11:30:55';
    testData.releasePickupDate = '2021-08-25 11:30:55';
    testData.releaseBeginDate = '2021-08-25 11:35:55';
    testData.visitId = 1;
    testData.visitBeginDate = '2021-08-25 11:40:55';
    testData.visitEndDate = '2021-08-25 11:40:55';
    testData.patients[0].callOutcome.CallOutcome.CallOutcome = 'Admission';
    testData.patients[0].callOutcome.CallOutcome.CallOutcomeId = 1;
    testData.patients[0].tagNumber = 'C1';
    testData.releaseDetailsId = 1;
    testData.streetTreatCaseId = 2;
    testData.trueStatus = 'In Progress';
    testData.ambulanceAction = 'STRelease';
    const data = service.getAssignmentStatus(testData);
    expect(data.actionStatus).toEqual(testData.trueStatus);
  });






});
