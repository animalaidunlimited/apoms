import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { CaseService } from 'src/app/modules/emergency-register/services/case.service';
import { EMPTY } from 'rxjs'


@Injectable({ providedIn: 'root' })
export class UniqueEmergencyNumberValidator {
  constructor(private caseService: CaseService) {}

  validate(emergencyCaseId:number, checkExists:number): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {

      //If the form hasn't been touched then don't validate
      if(control.pristine){
        return of(null);
      }

      return this.caseService.checkEmergencyNumberExists(control.value, emergencyCaseId)
        .pipe(
          map(res => {
            // if username is already taken
            if (res[0]["@success"] == checkExists) {
              // return error
              return { 'emergencyNumberTaken': true };
            }
          })
        );
    };

  }

}

