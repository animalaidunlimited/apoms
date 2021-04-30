import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { ABCStatus, ReleaseStatus, Temperament, Age } from 'src/app/core/enums/patient-details';
import { TreatmentList, ReportPatientRecord, TreatmentAreaChange, TreatmentListMoveIn } from 'src/app/core/models/census-details';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';

import { APIService } from 'src/app/core/services/http/api.service';




@Injectable({
  providedIn: 'root'
})
export class TreatmentListService extends APIService {

  endpoint = 'TreatmentList';

  treatmentListObject: BehaviorSubject<FormGroup>;

  treatmentListForm:FormGroup;

  acceptedFormArray: FormArray;

  constructor(public http: HttpClient,
    private fb: FormBuilder) {
    super(http);

    this.treatmentListForm = this.getEmptyTreatmentForm();

    this.acceptedFormArray = this.treatmentListForm.get('accepted') as FormArray;

    this.treatmentListObject = new BehaviorSubject<FormGroup>(this.treatmentListForm);

}

public getTreatmentList() : BehaviorSubject<FormGroup> {

  return this.treatmentListObject;

}

  public populateTreatmentList(treatmentAreaId:number, selectedDate: Date | string) : void {

    const request = `?treatmentAreaId=${treatmentAreaId}&selectedDate=${selectedDate}`;

    // Let's get the treatment list and sort it before we send it to the component
    this.get(request).then((unknownResponse:any) => {

      const response = unknownResponse as TreatmentList[];

      this.prepareTreatmentListSubjects(response);

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

      list.treatmentList = list.treatmentList.map((patient) => {

        const patientObject = JSON.parse(JSON.stringify(patient));

        patient['ABC status'] = ABCStatus[patientObject['ABC status']];
        patient['Release status'] = ReleaseStatus[patientObject['Release status']];
        // tslint:disable-next-line: no-string-literal
        patient['Temperament'] = Temperament[patientObject['Temperament']];
        // tslint:disable-next-line: no-string-literal
        patient['Age'] = Age[patientObject['Age']];

        return patient;

      });

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
      treatmentListId: 0,
      index: 0,
      'Emergency number': 0,
      PatientId: 0,
      PatientStatusId: 0,
      PatientStatus: '',
      'Tag number': '',
      Species: '',
      Age: '',
      'Caller name': '',
      Number: 0,
      'Call date': '',
      'ABC status': '',
      'Release ready': false,
      'Release status': '',
      Temperament: '',
      'Treatment priority': 0,
      'Actioned by area': '',
      'Moved to': 0,
      'Move accepted': false,
      Admission: false,
      showOther: false,
      treatedToday: false,
      saving: false,
      saved: false
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
            movedPatient.get('Admission')?.setValue(accepted);

            const ml = movedList.get('movedList') as FormArray;
            ml.removeAt(index);

            if(accepted){
              this.acceptMoveIn(movedPatient);
            }

          }
        });

      });

    }

    this.emitTreatmentObject();

  });

}

  private acceptMoveIn(movedPatient: AbstractControl) {

    const acceptedList = this.treatmentListForm.get('accepted') as FormArray;
    acceptedList.push(movedPatient);
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
