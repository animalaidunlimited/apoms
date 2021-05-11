import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ABCStatus, ReleaseStatus, Temperament, Age } from 'src/app/core/enums/patient-details';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';
import { PatientCountInArea, ReportPatientRecord, TreatmentAreaChange, TreatmentList, TreatmentListMoveIn } from 'src/app/core/models/treatment-lists';
import { APIService } from 'src/app/core/services/http/api.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';

@Injectable({
  providedIn: 'root'
})

export class TreatmentListService extends APIService {

  endpoint = 'TreatmentList';

  treatmentListObject: BehaviorSubject<FormGroup>;
  refreshing = new BehaviorSubject<boolean>(false);

  treatmentListForm:FormGroup;

  acceptedFormArray: FormArray;

  constructor(public http: HttpClient,
    private snackbar: SnackbarService,
    private fb: FormBuilder) {
    super(http);

    this.treatmentListForm = this.getEmptyTreatmentForm();

    this.acceptedFormArray = this.treatmentListForm.get('accepted') as FormArray;

    this.treatmentListObject = new BehaviorSubject<FormGroup>(this.treatmentListForm);

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
        this.refreshing.next(false);
      }
      else if(unknownResponse[0]?.success === -1){
        this.snackbar.errorSnackBar('An error has occured in the database. Please see admin', 'OK');
        this.refreshing.next(false);
      }
      else {
        const response = unknownResponse as TreatmentList[];
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
      }
      else {

        // movedLists.removeControl(list.treatmentListType);
        const newList = this.fb.group({
          listType: list.treatmentListType
        });
        newList.addControl('movedList', treatmentListArray);

        movedLists.push(newList);

      }

    });

    this.treatmentListForm.removeControl('movedLists');
    this.treatmentListForm.addControl('movedLists', movedLists);

    this.emitTreatmentObject();

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

    this.treatmentListObject.next(this.treatmentListForm);
    this.refreshing.next(false);

  }

  public resetTreatmentList(){

    this.treatmentListForm = this.getEmptyTreatmentForm();

    this.emitTreatmentObject();


  }

  private getTreatmentListForm(response: ReportPatientRecord[]) : FormArray {

    const returnArray = this.fb.array([]);

    response.forEach(() => returnArray.push(this.getEmptyPatient()));

    returnArray.patchValue(response);

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
      treatedToday: false,
    });

    return returnGroup;
  }


public async movePatientOutOfArea(currentPatient:AbstractControl, areaId: number){

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

        sortResult = (a.get('Treatment priority')?.value || 999) > (b.get('Treatment priority')?.value || 999) ? 1 : -1;
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
