import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';
import { PatientCountInArea, ReportPatientRecord, TreatmentAreaChange, TreatmentList, TreatmentListMoveIn } from 'src/app/core/models/treatment-lists';
import { APIService } from 'src/app/core/services/http/api.service';
import { PatientService } from 'src/app/core/services/patient/patient.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';

interface AcceptRejectMove{
  messageType: string;
  action: string;
  patientId: number;
  actionedByArea: string;
  actionedByAreaId: number;
  accepted: boolean;
}

interface TreatmentListMovement {
  recordType: string;
  currentAreaId: number;
  treatmentPatient: ReportPatientRecord;
}

@Injectable({
  providedIn: 'root'
})


export class TreatmentListService extends APIService {

  acceptedFormArray: FormArray;
  currentAreaId:number | undefined;

  endpoint = 'TreatmentList';

  hasPermission = new BehaviorSubject<boolean>(false);
  movedListFormArray: FormArray;

  refreshing = new BehaviorSubject<boolean>(false);
  treatmentListForm:FormGroup;
  treatmentListObject: BehaviorSubject<FormGroup>;

  constructor(public http: HttpClient,
    private snackbar: SnackbarService,
    private patientService: PatientService,
    private zone: NgZone,
    private fb: FormBuilder) {
    super(http);

    this.treatmentListForm = this.getEmptyTreatmentForm();

    this.acceptedFormArray = this.treatmentListForm.get('accepted') as FormArray;
    this.movedListFormArray = this.treatmentListForm.get('movedLists') as FormArray;

    this.treatmentListObject = new BehaviorSubject<FormGroup>(this.treatmentListForm);

}

public setCurrentArea(areaId:number){
  this.currentAreaId = areaId;
}

public setHasPermission(hasPermission: boolean){
  this.hasPermission.next(hasPermission);
}

public receiveAcceptRejectMessage(acceptReject:AcceptRejectMove){

      // Find it in the accepted list
      const removeIndex = this.acceptedFormArray.controls.findIndex(currentPatient => currentPatient.get('PatientId')?.value === acceptReject.patientId);

      const patientToMove = this.acceptedFormArray.at(removeIndex);

      // Move it from the accepted list to the rejected list if we need to
      if(!acceptReject.accepted && this.currentAreaId !== acceptReject.actionedByAreaId){

        patientToMove?.get('Actioned by area')?.setValue(acceptReject.actionedByArea);
        patientToMove?.get('Moved to')?.setValue(null);

        const movedLists = this.treatmentListForm.get('movedLists') as FormArray;

        const movedListIndex = movedLists.controls.findIndex(currentList => currentList.get('listType')?.value === 'rejected from');

        // If the list exists then push the new patient, otherwise create a new list
        movedListIndex === -1 ?
          movedLists.push(this.getEmptyMovedList('rejected from', this.fb.array([patientToMove])))
          :
          ((movedLists.at(movedListIndex) as FormArray).get('movedList') as FormArray).push(patientToMove);

      }
      else {
        // It's an acceptance so let's find it in the movement records and then shift it to the correct location

        this.movedListFormArray.controls.forEach(movedList => {

          const currentList = movedList.get('movedList') as FormArray;

          const foundPatient = currentList.controls.findIndex(currentPatient => currentPatient.get('PatientId')?.value === acceptReject.patientId);

          if(foundPatient > -1) {
            const movedPatient = currentList.at(foundPatient);

            if(removeIndex === -1) {

              this.acceptedFormArray.push(movedPatient);
            }
            currentList.removeAt(foundPatient);
          }

        });

      }

      if((patientToMove?.get('Actioned by area')?.value === acceptReject.actionedByArea || patientToMove?.get('Moved to')?.value) && removeIndex > -1){
        // Remove it from the accepted list if we need to
        this.acceptedFormArray.removeAt(removeIndex);

      }

    this.sortTreatmentList();
    this.emitTreatmentObject();

}

  public receiveMovementMessage(movementRecord: TreatmentListMovement[]) {

    movementRecord.forEach(patient => {

      // Try and find the patient in the accepted array, if it doesn't exist, add it in, if it does exist update it
      if (patient.recordType === 'accepted') {

        const patientFoundIndex = this.acceptedFormArray.controls.findIndex(existingPatient => existingPatient.get('PatientId')?.value
          ===
          patient.treatmentPatient.PatientId);

        if (patient.currentAreaId !== this.currentAreaId && patientFoundIndex > -1) {
          this.acceptedFormArray.removeAt(patientFoundIndex);
        }
        else if(patient.currentAreaId === this.currentAreaId) {

          patientFoundIndex === -1 ?
            this.addAcceptedRecord(patient.treatmentPatient) :
            this.updateAcceptedRecord(patient.treatmentPatient, patientFoundIndex);
        }


      }
      else {


        // Now we need to search through the lists to find a home for the incoming record. We may already have it because multiple people
        // could be working on the same list at the same time.
        const listParent = this.movedListFormArray.controls.find(movedList => movedList.get('listType')?.value === patient.recordType);

        if(listParent){

          const foundList = (listParent?.get('movedList') as FormArray);

          const patientFound = foundList.controls.findIndex(currentPatient => currentPatient.get('PatientId')?.value === patient.treatmentPatient.PatientId);

          if (patient.currentAreaId !== this.currentAreaId) {

            if(patientFound > -1) {
              foundList.removeAt(patientFound);
            }

          }
          else {

            foundList.controls.splice(patientFound, patientFound > -1 ? 1 : 0, this.hydrateEmptyPatient(patient.treatmentPatient));

          }

        }
        else if(patient.currentAreaId === this.currentAreaId) {

          const newList = this.fb.array([this.hydrateEmptyPatient(patient.treatmentPatient)]);

          this.movedListFormArray.push(this.getEmptyMovedList(patient.recordType, newList));

        }

      }

      this.sortTreatmentList();
      this.emitTreatmentObject();


    });
  }

  private addAcceptedRecord(patient: ReportPatientRecord) {
      this.acceptedFormArray.push(this.hydrateEmptyPatient(patient));
  }


  private updateAcceptedRecord(patient: ReportPatientRecord, index: number) {

    this.acceptedFormArray.controls.splice(index, 1, this.hydrateEmptyPatient(patient));
  }

  private hydrateEmptyPatient(patient: ReportPatientRecord) {

    const newRecord = this.getEmptyPatient();

    newRecord.patchValue(patient);
    return newRecord;
  }


public async getTreatmentListPatientCount(): Promise<PatientCountInArea[] | null>{
  const request = '?CountPatient';
  return this.get(request);
}

public async getTreatmentAreaHistoryByTag(tagNumber : string): Promise<any>{
  const request = '?TagNumber=' + tagNumber;
  return this.get(request);
}

public getTreatmentList() : BehaviorSubject<FormGroup> {

  return this.treatmentListObject;

}

  public populateTreatmentList(treatmentAreaId:number, selectedDate: Date | string) : void {

    if(treatmentAreaId === 0){
      return;
    }

    this.refreshing.next(true);

    const request = `?treatmentAreaId=${treatmentAreaId}&selectedDate=${selectedDate}`;

    // Let's get the treatment list and sort it before we send it to the component
    this.get(request).then((unknownResponse:any) => {

       if(!unknownResponse){
        const response = unknownResponse || [] as TreatmentList[];
        this.prepareTreatmentListSubjects(response);
       }
       else if (unknownResponse[0]?.success === -1){
        this.snackbar.errorSnackBar('An error has occured in the database. Please see admin', 'OK');
        this.refreshing.next(false);
      }
      else{
        const response = unknownResponse || [] as TreatmentList[];
        this.prepareTreatmentListSubjects(response);
      }

    });
  }

  public prepareTreatmentListSubjects(response: TreatmentList[]): void {

    this.treatmentListForm = this.getEmptyTreatmentForm();

    if(!response){

      this.emitTreatmentObject();
      return;

    }

    const movedLists:FormArray = this.fb.array([]);

    response.forEach(list => {

      list.treatmentList.sort(this.sortTreatmentRecords);

      const treatmentListArray = this.getTreatmentListForm(list.treatmentList);

      if(list.treatmentListType === 'accepted'){
        this.treatmentListForm.removeControl('accepted');
        this.treatmentListForm.addControl('accepted', treatmentListArray);
        this.sortTreatmentList();
      }
      else {

        movedLists.push(this.getEmptyMovedList(list.treatmentListType, treatmentListArray));

      }

    });

    this.treatmentListForm.removeControl('movedLists');
    this.treatmentListForm.addControl('movedLists', movedLists);

    this.emitTreatmentObject();

  }

  private getEmptyMovedList(listType: string, treatmentListArray: FormArray) {

    const newList = this.fb.group({listType});

    newList.addControl('movedList', treatmentListArray);
    return newList;
  }

  getEmptyTreatmentForm(): FormGroup {

    return this.fb.group({
      accepted: this.fb.array([]),
      movedLists: this.fb.array([])
    });

  }

  private sortTreatmentRecords(a: ReportPatientRecord, b: ReportPatientRecord){

    let sortResult = 0;

        if ((a['Treatment priority'] || 999) === (b['Treatment priority'] || 999)) {

          sortResult = a['Tag number'] < b['Tag number'] ? -1 : 1;
        }
        else {

          sortResult = (a['Treatment priority'] || 999) > (b['Treatment priority'] || 999) ? 1 : -1;
        }

        return sortResult;

  }

  private emitTreatmentObject(){

    this.acceptedFormArray = this.treatmentListForm.get('accepted') as FormArray;
    this.movedListFormArray = this.treatmentListForm.get('movedLists') as FormArray;

    this.zone.run(() => this.treatmentListObject.next(this.treatmentListForm));
    this.zone.run(() => this.refreshing.next(false));

  }

  public resetTreatmentList(){

    this.treatmentListForm = this.getEmptyTreatmentForm();

    this.emitTreatmentObject();


  }

  public getMovedInArray() : AbstractControl[]{

    const returnArray = [];

    for(let i = 0; i < 10; i++){

      returnArray.push(this.getEmptyPatient());
    }

    return returnArray as AbstractControl[];

  }

  private getTreatmentListForm(response: ReportPatientRecord[]) : FormArray {

    const returnArray = this.fb.array([]);

    response.forEach(() => returnArray.push(this.getEmptyPatient()));

    returnArray.patchValue(response);

    // We need to build a similar array for sending to the patient details update. The first patient details array
    // is named so that we can dynamically add columns to a table. Hence the namings are like 'Release status'
    // Whereas the patient service requires them like releaseStatus
    returnArray.controls.forEach(patient => {

      const patientFormGroup = patient as FormGroup;

      const patientDetails = this.patientService.getUpdatePatientObject(patient);

      patientFormGroup.addControl('patientDetails', patientDetails);

    });

    return returnArray;

  }

  private getEmptyPatient(): FormGroup {

    const returnGroup = this.fb.group({
      'ABC status': '',
      'Actioned by area': '',
      Admission: false,
      Age: '',
      animalTypeId: 0,
      'Call date': '',
      'Caller name': '',
      Description: '',
      'Emergency number': 0,
      index: 0,
      'Known as name': '',
      'Main problems': '',
      'Move accepted': false,
      'Moved to': 0,
      Number: 0,
      PatientId: 0,
      PatientStatus: '',
      PatientStatusId: 0,
      'Release ready': false,
      'Release status': '',
      saved: false,
      saving: false,
      Sex: '',
      showOther: false,
      Species: '',
      'Tag number': '',
      Temperament: '',
      'Treatment priority': 0,
      treatmentListId: 0,
      treatedToday: false
    });

    return returnGroup;
  }


public async movePatientOutOfArea(currentPatient:AbstractControl, areaId: number){

  if(!this.hasPermission){

  }

  const updatedPatient:TreatmentAreaChange = {
    treatmentListId: currentPatient.get('treatmentListId')?.value,
    admission: currentPatient.get('Admission')?.value,
    patientId: currentPatient.get('PatientId')?.value,
    movedFromArea: areaId,
    movedToArea: currentPatient.get('Moved to')?.value,
    movedDate: new Date(),
    movedInAccepted: currentPatient.get('Move accepted')?.value
  };

  return await this.putSubEndpoint('MoveOut', updatedPatient);

}

public async acceptRejectMoveIn(acceptedMovePatient:AbstractControl, accepted:boolean){

  const params = this.extractTreatmentListMoveInObject(acceptedMovePatient, accepted);

  this.putSubEndpoint('AcceptRejectMoveIn', params).then((response: SuccessOnlyResponse) => {

    if(response.success === 1){

      const movedLists = this.treatmentListForm.get('movedLists') as FormArray;

      // Go through all of the moved lists
      movedLists.controls.forEach(movedList => {

        const currentList = movedList.get('movedList') as FormArray;

        // Now go through all of the controls and move the one we're changing
        currentList.controls.forEach((element, index:number) => {

          if(element.get('PatientId')?.value === acceptedMovePatient.get('PatientId')?.value){

            const movedPatient = currentList.at(index);

            movedPatient.get('Move accepted')?.setValue(true);
            movedPatient.get('Actioned by area')?.reset();
            movedPatient.get('Moved to')?.reset();
            movedPatient.get('Admission')?.setValue(false);

            const ml = movedList.get('movedList') as FormArray;
            ml.removeAt(index);

            if(accepted){
              this.acceptMoveIn(movedPatient);
            }

          }
        });

      });

    }
    else {
      this.snackbar.errorSnackBar('Action failed: please see admin', 'OK');
    }


    this.emitTreatmentObject();

  });

}

private acceptMoveIn(movedPatient: AbstractControl) {

  const acceptedList = this.treatmentListForm.get('accepted') as FormArray;
  acceptedList.push(movedPatient);
  acceptedList.controls.sort(this.sortTreatmentAbstractControls);
}

public sortTreatmentList(){

  const acceptedList = this.treatmentListForm.get('accepted') as FormArray;
  acceptedList.controls.sort(this.sortTreatmentAbstractControls);

  this.emitTreatmentObject();

}

private sortTreatmentAbstractControls(a: AbstractControl, b: AbstractControl){

  let sortResult = 0;

      if ((a.get('Treatment priority')?.value || 999) === (b.get('Treatment priority')?.value || 999)) {

        sortResult = a.get('Tag number')?.value < b.get('Tag number')?.value ? -1 : 1;
      }
      else {

        sortResult = (a.get('Treatment priority')?.value || 999) < (b.get('Treatment priority')?.value || 999) ? 1 : -1;
      }

      return sortResult;

}


private extractTreatmentListMoveInObject(currentPatient: AbstractControl, accepted: boolean): TreatmentListMoveIn {

  return {
    patientId: currentPatient.get('PatientId')?.value,
    treatmentListId: currentPatient.get('treatmentListId')?.value,
    admission: currentPatient.get('admission')?.value,
    accepted
  };
}


}
