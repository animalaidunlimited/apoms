import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { PatientService } from 'src/app/pages/modules/emergency-register/services/patient.service';

@Injectable({ providedIn: 'root' })
export class UniqueTagNumberValidator {
  constructor(private patientService: PatientService) {}

  validate(emergencyCaseId:number, patientId:number): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {

      return this.patientService.checkTagNumberExists(control.value, emergencyCaseId, patientId)
        .pipe(
          map(res => {

            // if tag number is already taken
            if (res[0]["@success"] == "1") {
              // return error
              return { 'tagNumberTaken': true};
            }

          })
        );
    };

  }

}



